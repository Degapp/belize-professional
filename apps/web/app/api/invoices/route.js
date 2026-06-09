import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let invoices;
    
    if (professionalId && clientId && status) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        AND i.client_id = ${clientId}
        AND i.status = ${status}
        ORDER BY i.created_at DESC
      `;
    } else if (professionalId && status) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        AND i.status = ${status}
        ORDER BY i.created_at DESC
      `;
    } else if (professionalId) {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.professional_id = ${professionalId}
        ORDER BY i.created_at DESC
      `;
    } else {
      invoices = await sql`
        SELECT i.*, c.full_name as client_name 
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
      `;
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_id, appointment_id, items, subtotal, tax_amount, total_amount, due_date, notes } = body;

    // Get professional_id from the appointment if appointment_id is provided
    let professional_id;
    if (appointment_id) {
      const [appointment] = await sql`
        SELECT professional_id FROM appointments WHERE id = ${appointment_id}
      `;
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      professional_id = appointment.professional_id;
    } else {
      // If no appointment, get professional_id from client
      const [client] = await sql`
        SELECT professional_id FROM clients WHERE id = ${client_id}
      `;
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      professional_id = client.professional_id;
    }

    // Generate invoice number
    const [lastInvoice] = await sql`
      SELECT invoice_number FROM invoices 
      WHERE invoice_number IS NOT NULL AND invoice_number LIKE 'INV-%'
      ORDER BY id DESC 
      LIMIT 1
    `;

    let nextNumber = 1001;
    if (lastInvoice && lastInvoice.invoice_number) {
      const lastNumber = parseInt(lastInvoice.invoice_number.replace('INV-', ''));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const invoice_number = `INV-${nextNumber}`;

    // Create invoice
    const [invoice] = await sql`
      INSERT INTO invoices (
        professional_id,
        client_id,
        invoice_number,
        issue_date,
        due_date,
        subtotal,
        gst_amount,
        total_amount,
        notes,
        status,
        payment_status,
        currency
      ) VALUES (
        ${professional_id},
        ${client_id},
        ${invoice_number},
        CURRENT_DATE,
        ${due_date},
        ${subtotal},
        ${tax_amount},
        ${total_amount},
        ${notes},
        'draft',
        'unpaid',
        'USD'
      )
      RETURNING *
    `;

    // Create invoice items
    for (const item of items) {
      await sql`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          line_total
        ) VALUES (
          ${invoice.id},
          ${item.description},
          ${item.quantity},
          ${item.unit_price},
          ${item.amount}
        )
      `;
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
