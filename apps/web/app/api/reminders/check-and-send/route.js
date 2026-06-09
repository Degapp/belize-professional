import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all enabled reminder settings
    const settings = await sql`
      SELECT * FROM email_reminder_settings WHERE enabled = true
    `;

    if (settings.length === 0) {
      return NextResponse.json({ 
        message: 'No enabled reminder settings found',
        sent: 0 
      });
    }

    let totalSent = 0;
    const results = [];

    for (const setting of settings) {
      // Calculate reminder dates
      const beforeDueDate = new Date(today);
      beforeDueDate.setDate(beforeDueDate.getDate() + (setting.days_before_due || 3));

      const afterDueDate = new Date(today);
      afterDueDate.setDate(afterDueDate.getDate() - (setting.days_after_due || 0));

      // Find unpaid invoices that need reminders
      const invoices = await sql`
        SELECT i.*, c.full_name as client_name, c.email as client_email,
               p.display_name as professional_name, p.email as professional_email,
               p.firm_name
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        JOIN professionals p ON i.professional_id = p.id
        WHERE i.professional_id = ${setting.professional_id}
        AND i.payment_status IN ('unpaid', 'partial')
        AND i.status NOT IN ('draft', 'cancelled')
        AND (
          (i.due_date = ${beforeDueDate.toISOString().split('T')[0]} AND NOT EXISTS (
            SELECT 1 FROM email_reminder_logs 
            WHERE invoice_id = i.id 
            AND reminder_type = 'before_due' 
            AND sent_at > CURRENT_DATE - INTERVAL '7 days'
          ))
          OR
          (i.due_date = ${today.toISOString().split('T')[0]} AND NOT EXISTS (
            SELECT 1 FROM email_reminder_logs 
            WHERE invoice_id = i.id 
            AND reminder_type = 'on_due' 
            AND sent_at > CURRENT_DATE - INTERVAL '1 day'
          ))
          OR
          (i.due_date < ${today.toISOString().split('T')[0]} AND NOT EXISTS (
            SELECT 1 FROM email_reminder_logs 
            WHERE invoice_id = i.id 
            AND reminder_type = 'overdue' 
            AND sent_at > CURRENT_DATE - INTERVAL '7 days'
          ))
        )
      `;

      // Send reminders
      for (const invoice of invoices) {
        if (!invoice.client_email) {
          continue;
        }

        // Determine reminder type
        let reminderType;
        const dueDate = new Date(invoice.due_date);
        const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

        if (daysDiff > 0) {
          reminderType = 'before_due';
        } else if (daysDiff === 0) {
          reminderType = 'on_due';
        } else {
          reminderType = 'overdue';
        }

        // Customize message based on reminder type
        let subject = setting.email_subject || `Payment Reminder - Invoice ${invoice.invoice_number}`;
        let message = setting.email_message || '';

        if (reminderType === 'before_due') {
          subject = `Upcoming Payment Due - Invoice ${invoice.invoice_number}`;
          message = message || `Your invoice ${invoice.invoice_number} is due in ${Math.abs(daysDiff)} day(s). Please arrange payment to avoid any service interruption.`;
        } else if (reminderType === 'on_due') {
          subject = `Payment Due Today - Invoice ${invoice.invoice_number}`;
          message = message || `Your invoice ${invoice.invoice_number} is due today. Please process payment at your earliest convenience.`;
        } else {
          subject = `Overdue Payment Reminder - Invoice ${invoice.invoice_number}`;
          message = message || `Your invoice ${invoice.invoice_number} is now ${Math.abs(daysDiff)} day(s) overdue. Please remit payment immediately to avoid late fees.`;
        }

        // Replace template variables
        message = message
          .replace('{client_name}', invoice.client_name)
          .replace('{invoice_number}', invoice.invoice_number)
          .replace('{due_date}', new Date(invoice.due_date).toLocaleDateString())
          .replace('{amount}', `${invoice.currency} ${invoice.total_amount}`)
          .replace('{days_until_due}', daysDiff.toString())
          .replace('{days_overdue}', Math.abs(daysDiff).toString());

        // Send email (in production, integrate with email service)
        const emailData = {
          to: invoice.client_email,
          from: invoice.professional_email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">Payment Reminder</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">From ${invoice.firm_name || invoice.professional_name}</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Dear ${invoice.client_name},</p>
                <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${message}</p>
                
                <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Invoice Number:</strong></td>
                      <td style="padding: 8px 0; text-align: right; color: #333;">${invoice.invoice_number}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Issue Date:</strong></td>
                      <td style="padding: 8px 0; text-align: right; color: #333;">${new Date(invoice.issue_date).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;"><strong>Due Date:</strong></td>
                      <td style="padding: 8px 0; text-align: right; color: ${reminderType === 'overdue' ? '#ef4444' : '#333'};">${new Date(invoice.due_date).toLocaleDateString()}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #333; font-size: 18px;"><strong>Total Amount:</strong></td>
                      <td style="padding: 12px 0; text-align: right; color: #667eea; font-size: 22px; font-weight: bold;">${invoice.currency} ${invoice.total_amount}</td>
                    </tr>
                  </table>
                </div>
                
                ${invoice.payment_link_url ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${invoice.payment_link_url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 25px; font-weight: bold; font-size: 16px;">Pay Now</a>
                  </div>
                ` : ''}
                
                <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you have any questions or have already made this payment, please contact us immediately.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #999; font-size: 12px; margin: 0;">This is an automated reminder from ${invoice.firm_name || invoice.professional_name}.</p>
                </div>
              </div>
            </div>
          `
        };

        // Log the reminder
        try {
          await sql`
            INSERT INTO email_reminder_logs (
              invoice_id,
              reminder_type,
              sent_at,
              recipient_email,
              status
            ) VALUES (
              ${invoice.id},
              ${reminderType},
              NOW(),
              ${invoice.client_email},
              'sent'
            )
          `;

          totalSent++;
          results.push({
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            client: invoice.client_name,
            email: invoice.client_email,
            type: reminderType,
            status: 'sent'
          });
        } catch (logError) {
          await sql`
            INSERT INTO email_reminder_logs (
              invoice_id,
              reminder_type,
              sent_at,
              recipient_email,
              status,
              error_message
            ) VALUES (
              ${invoice.id},
              ${reminderType},
              NOW(),
              ${invoice.client_email},
              'failed',
              ${logError.message}
            )
          `;

          results.push({
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            client: invoice.client_name,
            email: invoice.client_email,
            type: reminderType,
            status: 'failed',
            error: logError.message
          });
        }

        // In production environment, this is where you'd actually send the email
        console.log('Email reminder would be sent:', emailData);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalSent} reminder(s)`,
      sent: totalSent,
      details: results
    });
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
    return NextResponse.json({ 
      error: 'Failed to process reminders',
      details: error.message 
    }, { status: 500 });
  }
}

// Allow GET requests to trigger the cron job
export async function GET(request) {
  return POST(request);
}
