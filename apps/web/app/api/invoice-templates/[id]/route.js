import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [template] = await sql`SELECT * FROM invoice_templates WHERE id = ${id}`;

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const {
      template_name,
      is_default,
      header_color,
      accent_color,
      show_logo,
      show_gst,
      terms_and_conditions,
      footer_text
    } = data;

    // If setting as default, get professional_id and unset other defaults
    if (is_default) {
      const [current] = await sql`SELECT professional_id FROM invoice_templates WHERE id = ${id}`;
      if (current) {
        await sql`
          UPDATE invoice_templates 
          SET is_default = false 
          WHERE professional_id = ${current.professional_id} AND id != ${id}
        `;
      }
    }

    const [updated] = await sql`
      UPDATE invoice_templates 
      SET 
        template_name = COALESCE(${template_name}, template_name),
        is_default = COALESCE(${is_default}, is_default),
        header_color = COALESCE(${header_color}, header_color),
        accent_color = COALESCE(${accent_color}, accent_color),
        show_logo = COALESCE(${show_logo}, show_logo),
        show_gst = COALESCE(${show_gst}, show_gst),
        terms_and_conditions = COALESCE(${terms_and_conditions}, terms_and_conditions),
        footer_text = COALESCE(${footer_text}, footer_text),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM invoice_templates WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
