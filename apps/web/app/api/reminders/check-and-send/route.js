import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { professional_id } = await request.json();

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Get reminder settings for this professional
    const [settings] = await sql`
      SELECT * FROM email_reminder_settings 
      WHERE professional_id = ${professional_id} AND enabled = true
    `;

    if (!settings) {
      return NextResponse.json({ 
        message: 'No reminder settings found or reminders disabled',
        sent: 0
      });
    }

    const today = new Date();
    const remindersSent = [];

    // Get all unpaid/pending invoices for this professional
    const invoices = await sql`
      SELECT i.*, c.full_name as client_name, c.email as client_email
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.professional_id = ${professional_id}
        AND i.status IN ('sent', 'overdue', 'pending')
        AND i.paid_at IS NULL
    `;

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.due_date);
      const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
      
      let reminderType = null;
      
      // Check if we should send a reminder
      if (daysDiff === settings.days_before_due) {
        reminderType = 'before_due';
      } else if (daysDiff === 0) {
        reminderType = 'on_due_date';
      } else if (daysDiff === -settings.days_after_due) {
        reminderType = 'after_due';
      }

      if (reminderType) {
        // Check if we already sent this reminder type today
        const [existingLog] = await sql`
          SELECT * FROM email_reminder_logs
          WHERE invoice_id = ${invoice.id}
            AND reminder_type = ${reminderType}
            AND sent_at::date = CURRENT_DATE
        `;

        if (!existingLog) {
          // Send the reminder
          const emailSubject = settings.email_subject
            .replace('{{invoice_number}}', invoice.invoice_number)
            .replace('{{client_name}}', invoice.client_name)
            .replace('{{total_amount}}', invoice.total_amount)
            .replace('{{currency}}', invoice.currency)
            .replace('{{due_date}}', invoice.due_date);

          const emailMessage = settings.email_message
            .replace('{{invoice_number}}', invoice.invoice_number)
            .replace('{{client_name}}', invoice.client_name)
            .replace('{{total_amount}}', invoice.total_amount)
            .replace('{{currency}}', invoice.currency)
            .replace('{{due_date}}', invoice.due_date);

          // In production, integrate with email service (Resend, SendGrid, etc.)
          // For now, we'll log the reminder
          const [logEntry] = await sql`
            INSERT INTO email_reminder_logs (
              invoice_id, 
              reminder_type, 
              recipient_email, 
              status
            )
            VALUES (
              ${invoice.id},
              ${reminderType},
              ${invoice.client_email},
              'sent'
            )
            RETURNING *
          `;

          remindersSent.push({
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            client_name: invoice.client_name,
            client_email: invoice.client_email,
            reminder_type: reminderType,
            subject: emailSubject,
            message: emailMessage
          });

          // Update invoice status if overdue
          if (reminderType === 'after_due' && invoice.status !== 'overdue') {
            await sql`
              UPDATE invoices 
              SET status = 'overdue'
              WHERE id = ${invoice.id}
            `;
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      sent: remindersSent.length,
      reminders: remindersSent
    });
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
    return NextResponse.json({ 
      error: 'Failed to process reminders',
      details: error.message 
    }, { status: 500 });
  }
}
