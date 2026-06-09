import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { contacts, professional_id } = await request.json();

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts array' }, { status: 400 });
    }

    // Fetch all existing clients for this professional
    const existingClients = await sql`
      SELECT full_name, email, phone 
      FROM clients 
      WHERE professional_id = ${professional_id || 1}
    `;

    // Create a map for quick lookup
    const clientMap = new Map();
    existingClients.forEach(client => {
      const emailKey = client.email?.toLowerCase().trim();
      const phoneKey = client.phone?.replace(/\D/g, ''); // Remove non-digits
      
      if (emailKey) clientMap.set(`email:${emailKey}`, client);
      if (phoneKey) clientMap.set(`phone:${phoneKey}`, client);
    });

    // Validate and deduplicate contacts
    const validated = contacts.map(contact => {
      const emailKey = contact.email?.toLowerCase().trim();
      const phoneKey = contact.phone?.replace(/\D/g, '');
      
      let isDuplicate = false;
      let duplicateMatch = null;

      // Check for duplicates
      if (emailKey && clientMap.has(`email:${emailKey}`)) {
        isDuplicate = true;
        duplicateMatch = clientMap.get(`email:${emailKey}`);
      } else if (phoneKey && clientMap.has(`phone:${phoneKey}`)) {
        isDuplicate = true;
        duplicateMatch = clientMap.get(`phone:${phoneKey}`);
      }

      return {
        ...contact,
        isDuplicate,
        duplicateMatch,
        isValid: !!(contact.full_name?.trim() && (contact.email || contact.phone))
      };
    });

    // Separate into new and duplicate contacts
    const newContacts = validated.filter(c => !c.isDuplicate && c.isValid);
    const duplicates = validated.filter(c => c.isDuplicate);
    const invalid = validated.filter(c => !c.isValid);

    return NextResponse.json({
      total: contacts.length,
      new: newContacts,
      duplicates,
      invalid,
      summary: {
        totalImported: contacts.length,
        newContactsCount: newContacts.length,
        duplicatesCount: duplicates.length,
        invalidCount: invalid.length
      }
    });
  } catch (error) {
    console.error('Error validating contacts:', error);
    return NextResponse.json({ 
      error: 'Failed to validate contacts',
      details: error.message 
    }, { status: 500 });
  }
}
