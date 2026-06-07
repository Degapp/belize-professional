import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const [invoice] = await sql`
      SELECT 
        i.*,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address,
        json_agg(
          json_build_object(
            'id', ii.id,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'line_total', ii.line_total
          ) ORDER BY ii.item_order
        ) FILTER (WHERE ii.id IS NOT NULL) as items
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.id = ${id}
      GROUP BY i.id, c.id
    `;

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get payments for this invoice
    const payments = await sql`
      SELECT * FROM payments 
      WHERE invoice_id = ${id}
      ORDER BY paid_at DESC
    `;

    return NextResponse.json({ ...invoice, payments });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const { 
      status, 
      payment_status, 
      notes,
      payment_link_url,
      sent_via_email,
      sent_via_whatsapp
    } = data;

    const [updated] = await sql`
      UPDATE invoices 
      SET 
        status = COALESCE(${status}, status),
        payment_status = COALESCE(${payment_status}, payment_status),
        notes = COALESCE(${notes}, notes),
        payment_link_url = COALESCE(${payment_link_url}, payment_link_url),
        sent_via_email = COALESCE(${sent_via_email}, sent_via_email),
        sent_via_whatsapp = COALESCE(${sent_via_whatsapp}, sent_via_whatsapp),
        paid_at = CASE 
          WHEN ${payment_status} = 'paid' AND paid_at IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE paid_at 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Delete invoice items first
    await sql`DELETE FROM invoice_items WHERE invoice_id = ${id}`;
    
    // Delete invoice
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
