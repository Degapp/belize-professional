import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const invoices = await sql`
      SELECT 
        i.*,
        p.display_name as professional_name,
        p.firm_name,
        c.full_name as client_name,
        c.email as client_email
      FROM invoices i
      LEFT JOIN professionals p ON i.professional_id = p.id
      LEFT JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `;

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
