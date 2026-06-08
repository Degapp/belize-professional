import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const professionals = await sql`
      SELECT 
        p.*,
        u.email as user_email,
        u.name as user_name,
        COUNT(DISTINCT c.id) as client_count,
        COUNT(DISTINCT i.id) as invoice_count,
        COUNT(DISTINCT a.id) as appointment_count
      FROM professionals p
      LEFT JOIN "user" u ON p.user_id::text = u.id
      LEFT JOIN clients c ON p.id = c.professional_id
      LEFT JOIN invoices i ON p.id = i.professional_id
      LEFT JOIN appointments a ON p.id = a.professional_id
      GROUP BY p.id, u.email, u.name
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}
