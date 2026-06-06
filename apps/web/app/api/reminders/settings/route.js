import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professional_id = searchParams.get('professional_id');

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    const [settings] = await sql`
      SELECT * FROM email_reminder_settings
      WHERE professional_id = ${professional_id}
    `;

    return NextResponse.json(settings || {
      professional_id: parseInt(professional_id),
      days_before_due: 7,
      days_after_due: 7,
      enabled: true,
      email_subject: 'Payment Reminder: Invoice {{invoice_number}}',
      email_message: 'Dear {{client_name}},\n\nThis is a friendly reminder about invoice {{invoice_number}} for {{total_amount}} {{currency}}.\n\nDue Date: {{due_date}}\n\nPlease complete payment at your earliest convenience.\n\nThank you!'
    });
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      professional_id, 
      days_before_due, 
      days_after_due, 
      enabled, 
      email_subject, 
      email_message 
    } = data;

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Check if settings exist
    const [existing] = await sql`
      SELECT * FROM email_reminder_settings
      WHERE professional_id = ${professional_id}
    `;

    let result;
    if (existing) {
      // Update existing settings
      [result] = await sql`
        UPDATE email_reminder_settings
        SET days_before_due = ${days_before_due},
            days_after_due = ${days_after_due},
            enabled = ${enabled},
            email_subject = ${email_subject},
            email_message = ${email_message},
            updated_at = CURRENT_TIMESTAMP
        WHERE professional_id = ${professional_id}
        RETURNING *
      `;
    } else {
      // Create new settings
      [result] = await sql`
        INSERT INTO email_reminder_settings (
          professional_id, 
          days_before_due, 
          days_after_due, 
          enabled, 
          email_subject, 
          email_message
        )
        VALUES (${professional_id}, ${days_before_due}, ${days_after_due}, ${enabled}, ${email_subject}, ${email_message})
        RETURNING *
      `;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving reminder settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
