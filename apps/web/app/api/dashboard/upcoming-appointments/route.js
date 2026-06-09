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

    const appointments = await sql`
      SELECT 
        a.id,
        a.title,
        a.start_at,
        a.end_at,
        a.meeting_type,
        c.full_name as client_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.professional_id = ${professionalId}
      AND a.start_at >= CURRENT_TIMESTAMP
      ORDER BY a.start_at ASC
      LIMIT ${parseInt(limit)}
    `;

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
