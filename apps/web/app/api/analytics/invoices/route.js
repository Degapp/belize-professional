import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Build date filter
    let dateFilter = sql``;
    if (startDate && endDate) {
      dateFilter = sql`AND i.issue_date BETWEEN ${startDate} AND ${endDate}`;
    } else if (startDate) {
      dateFilter = sql`AND i.issue_date >= ${startDate}`;
    } else if (endDate) {
      dateFilter = sql`AND i.issue_date <= ${endDate}`;
    }

    // Total revenue
    const [revenueData] = await sql`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN status = 'sent' OR status = 'overdue' THEN total_amount ELSE 0 END), 0) as outstanding_revenue
      FROM invoices i
      WHERE i.professional_id = ${professionalId} ${dateFilter}
    `;

    // Invoice status breakdown
    const statusBreakdown = await sql`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM invoices
      WHERE professional_id = ${professionalId} ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `;

    // Top clients by revenue
    const topClients = await sql`
      SELECT 
        c.id,
        c.full_name,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(i.total_amount), 0) as total_revenue
      FROM clients c
      JOIN invoices i ON c.id = i.client_id
      WHERE i.professional_id = ${professionalId} ${dateFilter}
      GROUP BY c.id, c.full_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    // Monthly revenue trend (last 12 months)
    const monthlyTrend = await sql`
      SELECT 
        TO_CHAR(issue_date, 'YYYY-MM') as month,
        COUNT(*) as invoice_count,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_revenue
      FROM invoices
      WHERE professional_id = ${professionalId}
      AND issue_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(issue_date, 'YYYY-MM')
      ORDER BY month DESC
    `;

    // Average invoice value
    const [avgData] = await sql`
      SELECT 
        COALESCE(AVG(total_amount), 0) as average_invoice_value,
        COUNT(*) as total_invoices
      FROM invoices
      WHERE professional_id = ${professionalId} ${dateFilter}
    `;

    // Payment method breakdown
    const paymentMethods = await sql`
      SELECT 
        p.payment_method,
        COUNT(*) as count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.professional_id = ${professionalId} ${dateFilter}
      GROUP BY p.payment_method
      ORDER BY total_amount DESC
    `;

    // Time to payment (average days)
    const [timeData] = await sql`
      SELECT 
        COALESCE(AVG(EXTRACT(DAY FROM (paid_at - issue_date))), 0) as avg_days_to_payment
      FROM invoices
      WHERE professional_id = ${professionalId}
      AND status = 'paid'
      AND paid_at IS NOT NULL ${dateFilter}
    `;

    return NextResponse.json({
      summary: {
        total_revenue: parseFloat(revenueData.total_revenue),
        paid_revenue: parseFloat(revenueData.paid_revenue),
        outstanding_revenue: parseFloat(revenueData.outstanding_revenue),
        average_invoice_value: parseFloat(avgData.average_invoice_value),
        total_invoices: parseInt(avgData.total_invoices),
        avg_days_to_payment: parseFloat(timeData.avg_days_to_payment)
      },
      status_breakdown: statusBreakdown,
      top_clients: topClients,
      monthly_trend: monthlyTrend,
      payment_methods: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
