import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice_id = searchParams.get('invoice_id');
    const professional_id = searchParams.get('professional_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let logs;
    
    if (invoice_id) {
      logs = await sql`
        SELECT l.*, i.invoice_number, c.full_name as client_name
        FROM email_reminder_logs l
        JOIN invoices i ON l.invoice_id = i.id
        JOIN clients c ON i.client_id = c.id
        WHERE l.invoice_id = ${invoice_id}
        ORDER BY l.sent_at DESC
        LIMIT ${limit}
      `;
    } else if (professional_id) {
      logs = await sql`
        SELECT l.*, i.invoice_number, c.full_name as client_name
        FROM email_reminder_logs l
        JOIN invoices i ON l.invoice_id = i.id
        JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professional_id}
        ORDER BY l.sent_at DESC
        LIMIT ${limit}
      `;
    } else {
      return NextResponse.json({ error: 'invoice_id or professional_id is required' }, { status: 400 });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching reminder logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
