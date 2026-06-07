import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'day', 'week', 'month'
    const date = searchParams.get('date'); // ISO date string
    
    let appointments;
    
    if (view && date) {
      const targetDate = new Date(date);
      let startDate, endDate;
      
      if (view === 'day') {
        startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === 'week') {
        const dayOfWeek = targetDate.getDay();
        startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (view === 'month') {
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      
      appointments = await sql`
        SELECT 
          a.*,
          c.full_name as client_name,
          c.email as client_email,
          c.phone as client_phone
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        WHERE a.start_at >= ${startDate.toISOString()} 
          AND a.start_at <= ${endDate.toISOString()}
        ORDER BY a.start_at ASC
      `;
    } else {
      appointments = await sql`
        SELECT 
          a.*,
          c.full_name as client_name,
          c.email as client_email,
          c.phone as client_phone
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        ORDER BY a.start_at DESC
        LIMIT 100
      `;
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      title, 
      description, 
      start_at, 
      end_at, 
      location_type, 
      location_details,
      status = 'scheduled'
    } = body;

    const [appointment] = await sql`
      INSERT INTO appointments (
        professional_id,
        client_id,
        title,
        description,
        start_at,
        end_at,
        location_type,
        location_details,
        status
      ) VALUES (
        1,
        ${client_id},
        ${title},
        ${description},
        ${start_at},
        ${end_at},
        ${location_type},
        ${location_details},
        ${status}
      ) RETURNING *
    `;

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
