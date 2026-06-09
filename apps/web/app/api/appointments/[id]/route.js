import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const [appointment] = await sql`
      SELECT 
        a.*,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = ${id}
    `;
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      start_at, 
      end_at, 
      location_type, 
      location_details,
      status,
      notes,
      attachments,
      send_reminder = true
    } = body;

    const [appointment] = await sql`
      UPDATE appointments
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        start_at = COALESCE(${start_at}, start_at),
        end_at = COALESCE(${end_at}, end_at),
        location_type = COALESCE(${location_type}, location_type),
        location_details = COALESCE(${location_details}, location_details),
        status = COALESCE(${status}, status),
        notes = COALESCE(${notes}, notes),
        attachments = COALESCE(${attachments ? JSON.stringify(attachments) : null}::jsonb, attachments),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Auto-schedule reminder if appointment is confirmed and 3+ days away
    if (send_reminder && status && (status === 'confirmed' || status === 'scheduled')) {
      const appointmentDate = new Date(start_at || appointment.start_at);
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // If appointment is 3+ days away, create/update scheduled reminder
      if (appointmentDate >= threeDaysFromNow) {
        const reminderDate = new Date(appointmentDate);
        reminderDate.setDate(reminderDate.getDate() - 3);

        // Check if reminder already exists
        const [existingReminder] = await sql`
          SELECT * FROM reminders
          WHERE appointment_id = ${id}
            AND recipient_type = 'client'
            AND channel = 'email'
            AND status IN ('scheduled', 'pending')
        `;

        if (existingReminder) {
          // Update existing reminder
          await sql`
            UPDATE reminders
            SET scheduled_for = ${reminderDate.toISOString()},
                updated_at = NOW()
            WHERE id = ${existingReminder.id}
          `;
        } else {
          // Create new reminder
          await sql`
            INSERT INTO reminders (
              appointment_id,
              recipient_type,
              channel,
              message,
              scheduled_for,
              status
            ) VALUES (
              ${id},
              'client',
              'email',
              'Payment reminder for upcoming appointment',
              ${reminderDate.toISOString()},
              'scheduled'
            )
          `;
        }
      }
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await sql`DELETE FROM appointments WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
