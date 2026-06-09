import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const invoiceId = searchParams.get('invoice_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let logs;

    if (invoiceId) {
      logs = await sql`
        SELECT l.*, i.invoice_number, c.full_name as client_name
        FROM email_reminder_logs l
        JOIN invoices i ON l.invoice_id = i.id
        JOIN clients c ON i.client_id = c.id
        WHERE l.invoice_id = ${invoiceId}
        ORDER BY l.sent_at DESC
        LIMIT ${limit}
      `;
    } else if (professionalId) {
      logs = await sql`
        SELECT l.*, i.invoice_number, c.full_name as client_name
        FROM email_reminder_logs l
        JOIN invoices i ON l.invoice_id = i.id
        JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        ORDER BY l.sent_at DESC
        LIMIT ${limit}
      `;
    } else {
      logs = await sql`
        SELECT l.*, i.invoice_number, c.full_name as client_name
        FROM email_reminder_logs l
        JOIN invoices i ON l.invoice_id = i.id
        JOIN clients c ON i.client_id = c.id
        ORDER BY l.sent_at DESC
        LIMIT ${limit}
      `;
    }

    // Get summary statistics
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN reminder_type = 'before_due' THEN 1 END) as before_due,
        COUNT(CASE WHEN reminder_type = 'on_due' THEN 1 END) as on_due,
        COUNT(CASE WHEN reminder_type = 'overdue' THEN 1 END) as overdue
      FROM email_reminder_logs
      ${professionalId ? sql`
        WHERE invoice_id IN (
          SELECT id FROM invoices WHERE professional_id = ${professionalId}
        )
      ` : sql``}
    `;

    return NextResponse.json({
      logs,
      stats: {
        total_sent: parseInt(stats.total_sent || 0),
        successful: parseInt(stats.successful || 0),
        failed: parseInt(stats.failed || 0),
        before_due: parseInt(stats.before_due || 0),
        on_due: parseInt(stats.on_due || 0),
        overdue: parseInt(stats.overdue || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching reminder logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
