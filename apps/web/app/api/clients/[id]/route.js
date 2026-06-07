import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Get client details
    const [client] = await sql`
      SELECT * FROM clients WHERE id = ${id}
    `;

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get appointment history
    const appointments = await sql`
      SELECT * FROM appointments 
      WHERE client_id = ${id}
      ORDER BY start_at DESC
      LIMIT 20
    `;

    // Get invoice history
    const invoices = await sql`
      SELECT * FROM invoices 
      WHERE client_id = ${id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get case history
    const cases = await sql`
      SELECT * FROM client_cases 
      WHERE client_id = ${id}
      ORDER BY opened_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      client,
      appointments,
      invoices,
      cases
    });
  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const {
      full_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      country,
      notes,
      kyc_status,
      custom_fields
    } = data;

    const [updated] = await sql`
      UPDATE clients 
      SET 
        full_name = COALESCE(${full_name}, full_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        date_of_birth = COALESCE(${date_of_birth}, date_of_birth),
        address = COALESCE(${address}, address),
        city = COALESCE(${city}, city),
        country = COALESCE(${country}, country),
        notes = COALESCE(${notes}, notes),
        kyc_status = COALESCE(${kyc_status}, kyc_status),
        custom_fields = COALESCE(${JSON.stringify(custom_fields)}, custom_fields),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM clients WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
