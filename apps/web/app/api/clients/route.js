import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const search = searchParams.get('search');

    let clients;
    
    if (search) {
      // Search by name, email, or phone
      clients = await sql`
        SELECT * FROM clients 
        WHERE professional_id = ${professionalId}
        AND (
          full_name ILIKE ${'%' + search + '%'} OR
          email ILIKE ${'%' + search + '%'} OR
          phone ILIKE ${'%' + search + '%'}
        )
        ORDER BY created_at DESC
      `;
    } else if (professionalId) {
      clients = await sql`
        SELECT * FROM clients 
        WHERE professional_id = ${professionalId}
        ORDER BY created_at DESC
      `;
    } else {
      clients = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      professional_id,
      full_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      country,
      notes,
      custom_fields
    } = data;

    const [client] = await sql`
      INSERT INTO clients (
        professional_id,
        full_name,
        email,
        phone,
        date_of_birth,
        address,
        city,
        country,
        notes,
        custom_fields,
        kyc_status
      ) VALUES (
        ${professional_id},
        ${full_name},
        ${email},
        ${phone},
        ${date_of_birth || null},
        ${address || null},
        ${city || null},
        ${country || null},
        ${notes || null},
        ${JSON.stringify(custom_fields || {})},
        'pending'
      )
      RETURNING *
    `;

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
