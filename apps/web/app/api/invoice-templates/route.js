import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    const templates = await sql`
      SELECT * FROM invoice_templates 
      WHERE professional_id = ${professionalId}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      professional_id,
      template_name,
      is_default,
      header_color,
      accent_color,
      show_logo,
      show_gst,
      terms_and_conditions,
      footer_text
    } = data;

    if (!professional_id || !template_name) {
      return NextResponse.json({ error: 'professional_id and template_name are required' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await sql`
        UPDATE invoice_templates 
        SET is_default = false 
        WHERE professional_id = ${professional_id}
      `;
    }

    const [template] = await sql`
      INSERT INTO invoice_templates (
        professional_id, template_name, is_default, header_color, accent_color,
        show_logo, show_gst, terms_and_conditions, footer_text
      ) VALUES (
        ${professional_id}, ${template_name}, ${is_default || false}, 
        ${header_color || '#1F2937'}, ${accent_color || '#3B82F6'},
        ${show_logo !== false}, ${show_gst !== false}, 
        ${terms_and_conditions || ''}, ${footer_text || ''}
      ) RETURNING *
    `;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
