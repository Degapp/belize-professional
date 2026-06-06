import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');

    if (!professionalId) {
      return NextResponse.json({ error: 'Professional ID required' }, { status: 400 });
    }

    // Get all clients with their invoice totals and payment status
    const clientHistory = await sql`
      SELECT 
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_billed,
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN i.status = 'pending' OR i.status = 'overdue' THEN i.total_amount ELSE 0 END), 0) as total_outstanding,
        MAX(GREATEST(c.updated_at, i.created_at, i.paid_at)) as last_interaction,
        STRING_AGG(DISTINCT i.status, ',') as payment_statuses
      FROM clients c
      LEFT JOIN invoices i ON c.id = i.client_id
      WHERE c.professional_id = ${professionalId}
      GROUP BY c.id, c.full_name, c.email, c.phone, c.created_at, c.updated_at
      ORDER BY last_interaction DESC
    `;

    return NextResponse.json(clientHistory);
  } catch (error) {
    console.error('Error fetching client history:', error);
    return NextResponse.json({ error: 'Failed to fetch client history' }, { status: 500 });
  }
}
