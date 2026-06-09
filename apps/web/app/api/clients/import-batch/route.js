import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { contacts, professional_id } = await request.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Invalid contacts array' }, { status: 400 });
    }

    const imported = [];
    const failed = [];

    for (const contact of contacts) {
      try {
        // Skip if missing required fields
        if (!contact.full_name?.trim()) {
          failed.push({ contact, reason: 'Missing name' });
          continue;
        }

        const result = await sql`
          INSERT INTO clients (
            professional_id,
            full_name,
            email,
            phone,
            address,
            city,
            country,
            kyc_status,
            created_at
          ) VALUES (
            ${professional_id || 1},
            ${contact.full_name.trim()},
            ${contact.email?.trim() || null},
            ${contact.phone?.trim() || null},
            ${contact.address?.trim() || null},
            ${contact.city?.trim() || null},
            ${contact.country?.trim() || null},
            'incomplete',
            NOW()
          )
          RETURNING *
        `;

        imported.push(result[0]);
      } catch (error) {
        console.error('Error importing contact:', error);
        failed.push({ contact, reason: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      failed: failed.length,
      clients: imported,
      errors: failed
    });
  } catch (error) {
    console.error('Error batch importing contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to import contacts',
      details: error.message 
    }, { status: 500 });
  }
}
