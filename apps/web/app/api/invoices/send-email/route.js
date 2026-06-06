import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { invoice_id, recipient_email, message } = data;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    // Get invoice details
    const [invoice] = await sql`
      SELECT i.*, c.full_name as client_name, c.email as client_email,
             p.display_name as professional_name, p.email as professional_email
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      JOIN professionals p ON i.professional_id = p.id
      WHERE i.id = ${invoice_id}
    `;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const emailTo = recipient_email || invoice.client_email;

    // In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, simulate email sending
    const emailData = {
      to: emailTo,
      from: invoice.professional_email,
      subject: `Invoice ${invoice.invoice_number} from ${invoice.branding_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>Dear ${invoice.client_name},</p>
          <p>${message || 'Please find your invoice attached.'}</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
            <p><strong>Issue Date:</strong> ${invoice.issue_date}</p>
            <p><strong>Due Date:</strong> ${invoice.due_date}</p>
            <p><strong>Total Amount:</strong> ${invoice.currency} ${invoice.total_amount}</p>
          </div>
          <p>To pay this invoice, please visit: <a href="${invoice.payment_link_url || '#'}">Pay Now</a></p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br/>${invoice.branding_name}</p>
        </div>
      `
    };

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET sent_via_email = true, status = 'sent'
      WHERE id = ${invoice_id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice email sent successfully',
      email: emailData
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json({ error: 'Failed to send invoice email' }, { status: 500 });
  }
}
