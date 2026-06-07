import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const reminders = await sql`
      SELECT * FROM reminders
      WHERE appointment_id = ${id}
      ORDER BY scheduled_for ASC
    `;
    
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching appointment reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { recipient_type, channel, scheduled_for, custom_message } = body;
    
    // Get appointment details
    const [appointment] = await sql`
      SELECT 
        a.*,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        p.display_name as professional_name,
        p.email as professional_email,
        p.phone as professional_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN professionals p ON a.professional_id = p.id
      WHERE a.id = ${id}
    `;
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Format appointment details
    const startTime = new Date(appointment.start_at).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const duration = Math.round((new Date(appointment.end_at) - new Date(appointment.start_at)) / (1000 * 60));
    
    const locationText = appointment.location_type === 'in_person' 
      ? `Location: ${appointment.location_details}`
      : appointment.location_type === 'zoom'
      ? `Zoom Link: ${appointment.location_details}`
      : `Phone: ${appointment.location_details}`;
    
    // Build the reminder message
    const defaultMessage = custom_message || 
      `Appointment Reminder\n\n` +
      `Title: ${appointment.title}\n` +
      `Date & Time: ${startTime}\n` +
      `Duration: ${duration} minutes\n` +
      `${locationText}\n` +
      (appointment.description ? `\nDetails: ${appointment.description}\n` : '') +
      `\nPlease confirm your attendance or contact us if you need to reschedule.`;
    
    // Create the reminder
    const [reminder] = await sql`
      INSERT INTO reminders (
        appointment_id,
        recipient_type,
        channel,
        message,
        scheduled_for,
        status
      ) VALUES (
        ${id},
        ${recipient_type},
        ${channel},
        ${defaultMessage},
        ${scheduled_for},
        'scheduled'
      ) RETURNING *
    `;
    
    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ 
      error: 'Failed to create reminder',
      details: error.message 
    }, { status: 500 });
  }
}
