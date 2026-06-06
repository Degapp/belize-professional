import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      invoice_id,
      amount,
      payment_method,
      card_number,
      card_holder,
      cvv,
      expiry_date
    } = data;

    if (!invoice_id || !amount || !payment_method) {
      return NextResponse.json({ 
        error: 'invoice_id, amount, and payment_method are required' 
      }, { status: 400 });
    }

    // Normalize payment method to match database constraint
    const validMethods = {
      'credit_card': 'card',
      'debit_card': 'card',
      'card': 'card',
      'bank_transfer': 'bank_transfer',
      'online_banking': 'online_banking',
      'cash': 'cash'
    };
    const normalizedMethod = validMethods[payment_method.toLowerCase()] || 'card';

    // Get invoice
    const [invoice] = await sql`
      SELECT * FROM invoices WHERE id = ${invoice_id}
    `;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // In production, integrate with Stripe/PayPal/etc.
    // For now, simulate payment processing
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const [payment] = await sql`
      INSERT INTO payments (
        invoice_id, amount, currency, payment_method, provider,
        provider_reference, status, paid_at
      ) VALUES (
        ${invoice_id}, ${amount}, ${invoice.currency}, ${normalizedMethod},
        'stripe', ${paymentReference}, 'succeeded', CURRENT_TIMESTAMP
      ) RETURNING *
    `;

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET status = 'paid', paid_at = CURRENT_TIMESTAMP
      WHERE id = ${invoice_id}
    `;

    return NextResponse.json({ 
      success: true,
      payment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
