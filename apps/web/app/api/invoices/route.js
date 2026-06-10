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
    const { 
      professional_id, 
      client_id, 
      invoice_number,
      issue_date,
      due_date,
      subtotal, 
      gst_amount, 
      total_amount, 
      currency,
      status,
      notes,
      items 
    } = body;

    // Validate required fields
    if (!professional_id || !client_id || !invoice_number || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
        currency,
        notes,
        status,
        payment_status
      ) VALUES (
        ${professional_id},
        ${client_id},
        ${invoice_number},
        ${issue_date || new Date().toISOString().split('T')[0]},
        ${due_date},
        ${subtotal || 0},
        ${gst_amount || 0},
        ${total_amount || 0},
        ${currency || 'BZD'},
        ${notes || null},
        ${status || 'draft'},
        'unpaid'
      )
      RETURNING *
    `;

    // Create invoice items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
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
            ${lineTotal}
          )
        `;
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
