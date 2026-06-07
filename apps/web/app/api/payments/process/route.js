import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { invoice_id, amount, payment_method, provider_reference } = data;

    if (!invoice_id || !amount) {
      return NextResponse.json({ 
        error: 'invoice_id and amount are required' 
      }, { status: 400 });
    }

    // Get invoice
    const [invoice] = await sql`
      SELECT * FROM invoices WHERE id = ${invoice_id}
    `;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Create payment record
    const [payment] = await sql`
      INSERT INTO payments (
        invoice_id, amount, currency, payment_method, 
        provider, provider_reference, status, paid_at
      ) VALUES (
        ${invoice_id}, ${amount}, ${invoice.currency || 'BZD'},
        ${payment_method || 'bank_transfer'}, 
        ${payment_method || 'manual'}, ${provider_reference || null},
        'completed', CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    // Update invoice status
    const [updatedInvoice] = await sql`
      UPDATE invoices 
      SET 
        status = 'paid',
        payment_status = 'paid',
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoice_id}
      RETURNING *
    `;

    return NextResponse.json({ 
      payment, 
      invoice: updatedInvoice 
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
