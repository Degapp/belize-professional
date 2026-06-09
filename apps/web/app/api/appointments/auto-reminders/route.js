import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * Automated appointment reminder system
 * Called via cron job to check for appointments 3 days away and send payment reminders
 */
export async function POST(request) {
  try {
    const { professional_id } = await request.json();

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Calculate the target date (3 days from now)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const endOfTargetDay = new Date(threeDaysFromNow);
    endOfTargetDay.setHours(23, 59, 59, 999);

    // Get all confirmed/scheduled appointments 3 days from now that haven't had reminders sent
    const appointments = await sql`
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
      WHERE a.professional_id = ${professional_id}
        AND a.status IN ('scheduled', 'confirmed')
        AND a.start_at >= ${threeDaysFromNow.toISOString()}
        AND a.start_at <= ${endOfTargetDay.toISOString()}
        AND (a.reminder_sent_at IS NULL OR a.reminder_sent_at < CURRENT_DATE)
    `;

    const remindersSent = [];

    for (const appointment of appointments) {
      // Calculate estimated cost based on appointment duration and hourly rate
      const startTime = new Date(appointment.start_at);
      const endTime = new Date(appointment.end_at);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      const estimatedCost = durationHours * (appointment.hourly_rate || 0);

      // Generate payment link (append appointment ID for tracking)
      const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/payment?appointment=${appointment.id}`;

      // Format appointment details for email
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

      const emailSubject = `Reminder: Upcoming ${appointment.title} on ${appointmentDate}`;
      
      const emailMessage = `
Dear ${appointment.client_name},

This is a friendly reminder about your upcoming appointment:

📅 Appointment Details:
- Service: ${appointment.title}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
${appointment.location_type ? `- Location: ${appointment.location_type === 'in_person' ? appointment.location_details : appointment.location_type}` : ''}
${appointment.description ? `- Description: ${appointment.description}` : ''}

💰 Payment Information:
${estimatedCost > 0 ? `Estimated Cost: $${estimatedCost.toFixed(2)} (${durationHours.toFixed(1)} hours @ $${appointment.hourly_rate}/hr)` : ''}

To secure your appointment, please complete payment before your scheduled time:
${paymentLink}

If you need to reschedule or have any questions, please contact us at ${appointment.professional_email}.

Thank you!

${appointment.firm_name || appointment.professional_name}
      `.trim();

      // Create a reminder record
      const [reminder] = await sql`
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
          ${emailMessage},
          ${threeDaysFromNow.toISOString()},
          'pending'
        ) RETURNING *
      `;

      // In production, integrate with email service (Resend, SendGrid, AWS SES)
      // For now, we'll mark as sent and log
      const [sentReminder] = await sql`
        UPDATE reminders
        SET status = 'sent', sent_at = NOW()
        WHERE id = ${reminder.id}
        RETURNING *
      `;

      // Update appointment to mark reminder sent
      await sql`
        UPDATE appointments
        SET reminder_sent_at = NOW()
        WHERE id = ${appointment.id}
      `;

      remindersSent.push({
        appointment_id: appointment.id,
        client_name: appointment.client_name,
        client_email: appointment.client_email,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        subject: emailSubject,
        payment_link: paymentLink,
        estimated_cost: estimatedCost,
        reminder_id: sentReminder.id
      });
    }

    return NextResponse.json({
      success: true,
      checked_date: threeDaysFromNow.toISOString().split('T')[0],
      appointments_found: appointments.length,
      reminders_sent: remindersSent.length,
      reminders: remindersSent
    });
  } catch (error) {
    console.error('Error processing auto-reminders:', error);
    return NextResponse.json({
      error: 'Failed to process auto-reminders',
      details: error.message
    }, { status: 500 });
  }
}
