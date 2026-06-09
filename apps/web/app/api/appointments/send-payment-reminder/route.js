import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Manually send a payment reminder for a specific appointment
 */
export async function POST(request) {
  try {
    const { appointment_id, custom_message } = await request.json();

    if (!appointment_id) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
    }

    // Get appointment details
    const [appointment] = await sql`
      SELECT 
        a.*,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        p.display_name as professional_name,
        p.firm_name,
        p.email as professional_email,
        p.hourly_rate
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN professionals p ON a.professional_id = p.id
      WHERE a.id = ${appointment_id}
    `;

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (!appointment.client_email) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 400 });
    }

    // Calculate duration and cost
    const startTime = new Date(appointment.start_at);
    const endTime = new Date(appointment.end_at);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    const estimatedCost = durationHours * (appointment.hourly_rate || 0);

    // Generate payment link
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/payment?appointment=${appointment.id}`;

    const appointmentDate = new Date(appointment.start_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const appointmentTime = new Date(appointment.start_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailMessage = custom_message || `
Dear ${appointment.client_name},

Payment reminder for your upcoming appointment:

📅 Appointment Details:
- Service: ${appointment.title}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
${appointment.location_type ? `- Location: ${appointment.location_type === 'in_person' ? appointment.location_details : appointment.location_type}` : ''}

💰 Payment Information:
${estimatedCost > 0 ? `Amount Due: $${estimatedCost.toFixed(2)}` : 'Payment required before appointment'}

Pay now: ${paymentLink}

Thank you!
${appointment.firm_name || appointment.professional_name}
    `.trim();

    // Create reminder record
    const [reminder] = await sql`
      INSERT INTO reminders (
        appointment_id,
        recipient_type,
        channel,
        message,
        scheduled_for,
        sent_at,
        status
      ) VALUES (
        ${appointment_id},
        'client',
        'email',
        ${emailMessage},
        NOW(),
        NOW(),
        'sent'
      ) RETURNING *
    `;

    // Update appointment reminder timestamp
    await sql`
      UPDATE appointments
      SET reminder_sent_at = NOW()
      WHERE id = ${appointment_id}
    `;

    return NextResponse.json({
      success: true,
      reminder_id: reminder.id,
      sent_to: appointment.client_email,
      appointment_date: appointmentDate,
      payment_link: paymentLink,
      message: emailMessage
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return NextResponse.json({
      error: 'Failed to send payment reminder',
      details: error.message
    }, { status: 500 });
  }
}
