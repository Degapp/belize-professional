import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let invoices;
    
    if (professionalId && clientId && status) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        AND i.client_id = ${clientId}
        AND i.status = ${status}
        ORDER BY i.created_at DESC
      `;
    } else if (professionalId && status) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        AND i.status = ${status}
        ORDER BY i.created_at DESC
      `;
    } else if (professionalId) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        ORDER BY i.created_at DESC
      `;
    } else {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
      `;
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
