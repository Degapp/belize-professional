import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appointments = await sql`
      SELECT 
        a.*,
        p.display_name as professional_name,
        p.firm_name,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM appointments a
      LEFT JOIN professionals p ON a.professional_id = p.id
      LEFT JOIN clients c ON a.client_id = c.id
      ORDER BY a.start_at DESC
    `;

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
