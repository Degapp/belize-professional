import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { invoice_id, phone_number, message } = data;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    // Get invoice details
    const [invoice] = await sql`
      SELECT i.*, c.full_name as client_name, c.phone as client_phone,
             p.display_name as professional_name
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN professionals p ON i.professional_id = p.id
      WHERE i.id = ${invoice_id}
    `;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const recipientPhone = phone_number || invoice.client_phone;

    if (!recipientPhone) {
      return NextResponse.json({ error: 'Phone number not found' }, { status: 400 });
    }

    // In production, integrate with WhatsApp Business API
    // For now, simulate WhatsApp message
    const whatsappMessage = message || 
      `Hi ${invoice.client_name}, your invoice ${invoice.invoice_number} for ${invoice.currency} ${invoice.total_amount} is ready. Due date: ${invoice.due_date}. ${invoice.payment_link_url ? 'Pay here: ' + invoice.payment_link_url : ''}`;

    const whatsappData = {
      to: recipientPhone,
      message: whatsappMessage,
      invoice_url: invoice.payment_link_url
    };

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET sent_via_whatsapp = true
      WHERE id = ${invoice_id}
    `;

    // Create reminder record
    await sql`
      INSERT INTO reminders (
        invoice_id, recipient_type, channel, message, scheduled_for, sent_at, status
      ) VALUES (
        ${invoice_id}, 'client', 'whatsapp', ${whatsappMessage}, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'sent'
      )
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp reminder sent successfully',
      data: whatsappData
    });
  } catch (error) {
    console.error('Error sending WhatsApp reminder:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp reminder' }, { status: 500 });
  }
}
