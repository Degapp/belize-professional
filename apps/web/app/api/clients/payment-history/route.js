import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const professionalId = searchParams.get('professional_id');

    if (!clientId || !professionalId) {
      return NextResponse.json(
        { error: 'client_id and professional_id are required' },
        { status: 400 }
      );
    }

    // Get all invoices for the client
    const invoices = await sql`
      SELECT 
        i.id,
        i.invoice_number,
        i.issue_date,
        i.due_date,
        i.total_amount,
        i.status,
        i.payment_status,
        i.paid_at,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as amount_paid
      FROM invoices i
      LEFT JOIN payments p ON i.id = p.invoice_id
      WHERE i.client_id = ${clientId}
      AND i.professional_id = ${professionalId}
      GROUP BY i.id, i.invoice_number, i.issue_date, i.due_date, 
               i.total_amount, i.status, i.payment_status, i.paid_at
      ORDER BY i.issue_date DESC
    `;

    // Get all payments for the client
    const payments = await sql`
      SELECT 
        p.id,
        p.invoice_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.provider,
        p.provider_reference,
        p.status,
        p.paid_at,
        i.invoice_number
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.client_id = ${clientId}
      AND i.professional_id = ${professionalId}
      ORDER BY p.paid_at DESC
    `;

    // Calculate summary stats
    const [summary] = await sql`
      SELECT 
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_outstanding_amount,
        COALESCE(SUM(CASE WHEN i.payment_status = 'paid' THEN i.total_amount ELSE 0 END), 0) as total_paid_amount,
        COALESCE(AVG(EXTRACT(DAY FROM (p.paid_at - i.issue_date))), 0) as avg_days_to_payment,
        COUNT(DISTINCT CASE WHEN i.payment_status = 'unpaid' THEN i.id END) as unpaid_invoices,
        COUNT(DISTINCT CASE WHEN i.status = 'sent' OR i.status = 'overdue' THEN i.id END) as overdue_invoices
      FROM invoices i
      LEFT JOIN payments p ON i.id = p.invoice_id AND p.status = 'completed'
      WHERE i.client_id = ${clientId}
      AND i.professional_id = ${professionalId}
    `;

    // Payment method breakdown
    const paymentMethods = await sql`
      SELECT 
        p.payment_method,
        COUNT(*) as count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.client_id = ${clientId}
      AND i.professional_id = ${professionalId}
      AND p.status = 'completed'
      GROUP BY p.payment_method
      ORDER BY total_amount DESC
    `;

    // Monthly payment trend (last 12 months)
    const monthlyTrend = await sql`
      SELECT 
        TO_CHAR(p.paid_at, 'YYYY-MM') as month,
        COUNT(*) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.client_id = ${clientId}
      AND i.professional_id = ${professionalId}
      AND p.paid_at >= CURRENT_DATE - INTERVAL '12 months'
      AND p.status = 'completed'
      GROUP BY TO_CHAR(p.paid_at, 'YYYY-MM')
      ORDER BY month DESC
    `;

    return NextResponse.json({
      invoices,
      payments,
      summary: {
        total_invoices: parseInt(summary.total_invoices),
        total_outstanding_amount: parseFloat(summary.total_outstanding_amount),
        total_paid_amount: parseFloat(summary.total_paid_amount),
        avg_days_to_payment: parseFloat(summary.avg_days_to_payment),
        unpaid_invoices: parseInt(summary.unpaid_invoices),
        overdue_invoices: parseInt(summary.overdue_invoices)
      },
      payment_methods: paymentMethods,
      monthly_trend: monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
