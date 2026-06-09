import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Get appointments count for this week
    const [appointmentsData] = await sql`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE professional_id = ${professionalId}
      AND start_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND start_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
    `;

    // Get total active clients
    const [clientsData] = await sql`
      SELECT COUNT(*) as count
      FROM clients
      WHERE professional_id = ${professionalId}
    `;

    // Get pending invoices count
    const [invoicesData] = await sql`
      SELECT COUNT(*) as count
      FROM invoices
      WHERE professional_id = ${professionalId}
      AND status IN ('sent', 'overdue', 'draft')
    `;

    return NextResponse.json({
      appointments_this_week: parseInt(appointmentsData.count) || 0,
      active_clients: parseInt(clientsData.count) || 0,
      pending_invoices: parseInt(invoicesData.count) || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
