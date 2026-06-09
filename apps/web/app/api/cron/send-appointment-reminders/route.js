import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

/**
 * CRON endpoint - Call this daily to check and send all pending appointment reminders
 * Can be triggered by Vercel Cron, GitHub Actions, or external cron service
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-appointment-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all scheduled reminders that should be sent today
    const pendingReminders = await sql`
      SELECT 
        r.*,
        a.title as appointment_title,
        a.start_at,
        a.end_at,
        a.location_type,
        a.location_details,
        a.description,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        p.display_name as professional_name,
        p.firm_name,
        p.email as professional_email,
        p.hourly_rate
      FROM reminders r
      JOIN appointments a ON r.appointment_id = a.id
      JOIN clients c ON a.client_id = c.id
      JOIN professionals p ON a.professional_id = p.id
      WHERE r.status IN ('scheduled', 'pending')
        AND r.channel = 'email'
        AND r.scheduled_for >= ${today.toISOString()}
        AND r.scheduled_for <= ${endOfDay.toISOString()}
        AND a.status IN ('scheduled', 'confirmed')
    `;

    const remindersSent = [];
    const remindersFailed = [];

    for (const reminder of pendingReminders) {
      try {
        // Calculate cost
        const startTime = new Date(reminder.start_at);
        const endTime = new Date(reminder.end_at);
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);
        const estimatedCost = durationHours * (reminder.hourly_rate || 0);

        // Generate payment link
        const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/payment?appointment=${reminder.appointment_id}`;

        const appointmentDate = new Date(reminder.start_at).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const appointmentTime = new Date(reminder.start_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const emailSubject = `Reminder: Upcoming ${reminder.appointment_title} on ${appointmentDate}`;
        
        const emailMessage = `
Dear ${reminder.client_name},

This is a friendly reminder about your upcoming appointment in 3 days:

📅 Appointment Details:
- Service: ${reminder.appointment_title}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
${reminder.location_type ? `- Location: ${reminder.location_type === 'in_person' ? reminder.location_details : reminder.location_type}` : ''}
${reminder.description ? `- Description: ${reminder.description}` : ''}

💰 Payment Information:
${estimatedCost > 0 ? `Estimated Cost: $${estimatedCost.toFixed(2)} (${durationHours.toFixed(1)} hours @ $${reminder.hourly_rate}/hr)` : 'Payment required'}

To secure your appointment, please complete payment:
${paymentLink}

If you need to reschedule or have questions, contact us at ${reminder.professional_email}.

Thank you!
${reminder.firm_name || reminder.professional_name}
        `.trim();

        // In production: Send actual email via Resend, SendGrid, AWS SES, etc.
        // Example with Resend:
        // await fetch('https://api.resend.com/emails', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     from: reminder.professional_email,
        //     to: reminder.client_email,
        //     subject: emailSubject,
        //     text: emailMessage
        //   })
        // });

        // Update reminder status to sent
        await sql`
          UPDATE reminders
          SET status = 'sent',
              sent_at = NOW(),
              message = ${emailMessage}
          WHERE id = ${reminder.id}
        `;

        // Update appointment reminder timestamp
        await sql`
          UPDATE appointments
          SET reminder_sent_at = NOW()
          WHERE id = ${reminder.appointment_id}
        `;

        remindersSent.push({
          reminder_id: reminder.id,
          appointment_id: reminder.appointment_id,
          client_email: reminder.client_email,
          subject: emailSubject,
          payment_link: paymentLink
        });
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        
        // Mark as failed
        await sql`
          UPDATE reminders
          SET status = 'failed'
          WHERE id = ${reminder.id}
        `;

        remindersFailed.push({
          reminder_id: reminder.id,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString().split('T')[0],
      total_pending: pendingReminders.length,
      sent: remindersSent.length,
      failed: remindersFailed.length,
      reminders_sent: remindersSent,
      reminders_failed: remindersFailed
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({
      error: 'Failed to process reminders',
      details: error.message
    }, { status: 500 });
  }
}
