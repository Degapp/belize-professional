import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const limit = searchParams.get('limit') || '5';

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    const invoices = await sql`
      SELECT 
        i.id,
        i.invoice_number,
        i.total_amount,
        i.status,
        i.issue_date,
        c.full_name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.professional_id = ${professionalId}
      ORDER BY i.created_at DESC
      LIMIT ${parseInt(limit)}
    `;

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
