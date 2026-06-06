import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      professional_id,
      client_id,
      time_entry_ids,
      custom_items,
      template_id,
      issue_date,
      due_date,
      notes
    } = data;

    if (!professional_id || !client_id) {
      return NextResponse.json({ 
        error: 'professional_id and client_id are required' 
      }, { status: 400 });
    }

    // Get professional info
    const [professional] = await sql`
      SELECT * FROM professionals WHERE id = ${professional_id}
    `;

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Get template if specified
    let template = null;
    if (template_id) {
      [template] = await sql`
        SELECT * FROM invoice_templates WHERE id = ${template_id}
      `;
    } else {
      // Get default template
      [template] = await sql`
        SELECT * FROM invoice_templates 
        WHERE professional_id = ${professional_id} AND is_default = true
        LIMIT 1
      `;
    }

    // Generate invoice number
    const [lastInvoice] = await sql`
      SELECT invoice_number FROM invoices 
      WHERE professional_id = ${professional_id}
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    let invoiceNumber = 'INV-0001';
    if (lastInvoice && lastInvoice.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.split('-')[1]);
      invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Calculate totals
    let subtotal = 0;
    const items = [];

    // Add time entries
    if (time_entry_ids && time_entry_ids.length > 0) {
      const timeEntries = await sql`
        SELECT * FROM time_entries 
        WHERE id = ANY(${time_entry_ids})
      `;

      for (const entry of timeEntries) {
        items.push({
          description: entry.description || 'Time Entry',
          quantity: entry.hours_worked,
          unit_price: entry.hourly_rate,
          line_total: entry.total_amount
        });
        subtotal += parseFloat(entry.total_amount);
      }
    }

    // Add custom items
    if (custom_items && custom_items.length > 0) {
      for (const item of custom_items) {
        const lineTotal = item.quantity * item.unit_price;
        items.push({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: lineTotal
        });
        subtotal += lineTotal;
      }
    }

    // Calculate GST and total
    const gstPercent = professional.gst_percent || 0;
    const gstAmount = (subtotal * gstPercent) / 100;
    const totalAmount = subtotal + gstAmount;

    // Create invoice
    const [invoice] = await sql`
      INSERT INTO invoices (
        professional_id, client_id, invoice_number, issue_date, due_date,
        status, subtotal, gst_amount, total_amount, currency,
        branding_name, branding_logo_url, branding_address, notes
      ) VALUES (
        ${professional_id}, ${client_id}, ${invoiceNumber},
        ${issue_date || new Date().toISOString().split('T')[0]},
        ${due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]},
        'draft', ${subtotal}, ${gstAmount}, ${totalAmount}, 'BZD',
        ${professional.firm_name || professional.display_name},
        ${professional.logo_url}, ${professional.address || ''},
        ${notes || template?.footer_text || ''}
      ) RETURNING *
    `;

    // Create invoice items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await sql`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, line_total, item_order
        ) VALUES (
          ${invoice.id}, ${item.description}, ${item.quantity}, 
          ${item.unit_price}, ${item.line_total}, ${i}
        )
      `;
    }

    // Mark time entries as invoiced
    if (time_entry_ids && time_entry_ids.length > 0) {
      await sql`
        UPDATE time_entries 
        SET invoiced = true, invoice_id = ${invoice.id}
        WHERE id = ANY(${time_entry_ids})
      `;
    }

    // Get complete invoice with items
    const completeInvoice = await sql`
      SELECT i.*, 
             json_agg(
               json_build_object(
                 'id', ii.id,
                 'description', ii.description,
                 'quantity', ii.quantity,
                 'unit_price', ii.unit_price,
                 'line_total', ii.line_total
               ) ORDER BY ii.item_order
             ) as items
      FROM invoices i
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.id = ${invoice.id}
      GROUP BY i.id
    `;

    return NextResponse.json(completeInvoice[0]);
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
