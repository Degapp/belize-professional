import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clients = await sql`
      SELECT 
        c.*,
        p.display_name as professional_name,
        p.firm_name,
        COUNT(DISTINCT i.id) as invoice_count,
        COUNT(DISTINCT a.id) as appointment_count,
        SUM(CASE WHEN i.payment_status = 'paid' THEN i.total_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN i.payment_status = 'unpaid' THEN i.total_amount ELSE 0 END) as total_outstanding
      FROM clients c
      LEFT JOIN professionals p ON c.professional_id = p.id
      LEFT JOIN invoices i ON c.id = i.client_id
      LEFT JOIN appointments a ON c.id = a.client_id
      GROUP BY c.id, p.display_name, p.firm_name
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
