import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    const [settings] = await sql`
      SELECT * FROM email_reminder_settings 
      WHERE professional_id = ${professionalId}
      LIMIT 1
    `;

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        professional_id: parseInt(professionalId),
        days_before_due: 3,
        days_after_due: 0,
        enabled: false,
        email_subject: 'Payment Reminder - Invoice {invoice_number}',
        email_message: 'Dear {client_name},\n\nThis is a friendly reminder that your invoice {invoice_number} for {amount} is due on {due_date}.\n\nPlease arrange payment at your earliest convenience.\n\nThank you for your business!'
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      professional_id,
      days_before_due,
      days_after_due,
      enabled,
      email_subject,
      email_message
    } = body;

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Check if settings already exist
    const [existing] = await sql`
      SELECT id FROM email_reminder_settings 
      WHERE professional_id = ${professional_id}
    `;

    let settings;

    if (existing) {
      // Update existing settings
      [settings] = await sql`
        UPDATE email_reminder_settings
        SET 
          days_before_due = ${days_before_due !== undefined ? days_before_due : 3},
          days_after_due = ${days_after_due !== undefined ? days_after_due : 0},
          enabled = ${enabled !== undefined ? enabled : false},
          email_subject = ${email_subject || 'Payment Reminder - Invoice {invoice_number}'},
          email_message = ${email_message || 'Dear {client_name}, this is a reminder about your invoice {invoice_number}.'},
          updated_at = NOW()
        WHERE professional_id = ${professional_id}
        RETURNING *
      `;
    } else {
      // Create new settings
      [settings] = await sql`
        INSERT INTO email_reminder_settings (
          professional_id,
          days_before_due,
          days_after_due,
          enabled,
          email_subject,
          email_message,
          created_at,
          updated_at
        ) VALUES (
          ${professional_id},
          ${days_before_due !== undefined ? days_before_due : 3},
          ${days_after_due !== undefined ? days_after_due : 0},
          ${enabled !== undefined ? enabled : false},
          ${email_subject || 'Payment Reminder - Invoice {invoice_number}'},
          ${email_message || 'Dear {client_name}, this is a reminder about your invoice {invoice_number}.'},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
