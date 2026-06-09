import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const date = searchParams.get('date');
    const clientId = searchParams.get('client_id');
    
    let appointments;
    
    if (clientId) {
      appointments = await sql`
        SELECT 
          a.*,
          c.full_name as client_name,
          c.email as client_email,
          c.phone as client_phone
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        WHERE a.client_id = ${parseInt(clientId)}
        ORDER BY a.start_at DESC
        LIMIT 50
      `;
    } else if (view && date) {
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
      status = 'scheduled',
      send_reminder = true
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

    // Auto-schedule reminder if appointment is confirmed/scheduled and 3+ days away
    if (send_reminder && (status === 'confirmed' || status === 'scheduled')) {
      const appointmentDate = new Date(start_at);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // If appointment is 3+ days away, create a scheduled reminder
      if (appointmentDate >= threeDaysFromNow) {
        const reminderDate = new Date(appointmentDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        await sql`
          INSERT INTO reminders (
            appointment_id,
            recipient_type,
            channel,
            message,
            scheduled_for,
            status
          ) VALUES (
            ${appointment.id},
            'client',
            'email',
            'Payment reminder for upcoming appointment',
            ${reminderDate.toISOString()},
            'scheduled'
          )
        `;
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
