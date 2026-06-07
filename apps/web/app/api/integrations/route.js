import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professional_id = searchParams.get('professional_id');

    if (!professional_id) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Get calendar integration
    const [calendarIntegration] = await sql`
      SELECT * FROM calendar_integrations
      WHERE professional_id = ${professional_id}
    `;

    // Get communication integration (email/whatsapp)
    const [communicationIntegration] = await sql`
      SELECT * FROM communication_integrations
      WHERE professional_id = ${professional_id}
    `;

    return NextResponse.json({
      calendar: calendarIntegration || null,
      communication: communicationIntegration || null
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { professional_id, integration_type, provider, config } = data;

    if (!professional_id || !integration_type || !provider) {
      return NextResponse.json({ 
        error: 'professional_id, integration_type, and provider are required' 
      }, { status: 400 });
    }

    let result;

    if (integration_type === 'calendar') {
      // Handle calendar integration
      const { access_token, refresh_token, calendar_id, sync_enabled } = config;

      const [existing] = await sql`
        SELECT * FROM calendar_integrations
        WHERE professional_id = ${professional_id}
      `;

      if (existing) {
        [result] = await sql`
          UPDATE calendar_integrations
          SET provider = ${provider},
              access_token = ${access_token || existing.access_token},
              refresh_token = ${refresh_token || existing.refresh_token},
              calendar_id = ${calendar_id || existing.calendar_id},
              sync_enabled = ${sync_enabled !== undefined ? sync_enabled : existing.sync_enabled},
              last_synced_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE professional_id = ${professional_id}
          RETURNING *
        `;
      } else {
        [result] = await sql`
          INSERT INTO calendar_integrations (
            professional_id, provider, access_token, refresh_token, 
            calendar_id, sync_enabled
          )
          VALUES (
            ${professional_id}, ${provider}, ${access_token}, ${refresh_token}, 
            ${calendar_id}, ${sync_enabled || false}
          )
          RETURNING *
        `;
      }
    } else if (integration_type === 'communication') {
      // Handle email/whatsapp integration
      const { channel, api_key, sender_address, sender_phone, enabled } = config;

      const [existing] = await sql`
        SELECT * FROM communication_integrations
        WHERE professional_id = ${professional_id}
      `;

      // Store last 4 digits of API key for display
      const api_key_last4 = api_key ? api_key.slice(-4) : null;

      if (existing) {
        [result] = await sql`
          UPDATE communication_integrations
          SET channel = ${channel || existing.channel},
              provider = ${provider},
              api_key_last4 = ${api_key_last4 || existing.api_key_last4},
              sender_address = ${sender_address || existing.sender_address},
              sender_phone = ${sender_phone || existing.sender_phone},
              enabled = ${enabled !== undefined ? enabled : existing.enabled},
              updated_at = CURRENT_TIMESTAMP
          WHERE professional_id = ${professional_id}
          RETURNING *
        `;
      } else {
        [result] = await sql`
          INSERT INTO communication_integrations (
            professional_id, channel, provider, api_key_last4,
            sender_address, sender_phone, enabled
          )
          VALUES (
            ${professional_id}, ${channel}, ${provider}, ${api_key_last4},
            ${sender_address}, ${sender_phone}, ${enabled || false}
          )
          RETURNING *
        `;
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid integration_type. Must be "calendar" or "communication"' 
      }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving integration:', error);
    return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professional_id = searchParams.get('professional_id');
    const integration_type = searchParams.get('integration_type');

    if (!professional_id || !integration_type) {
      return NextResponse.json({ 
        error: 'professional_id and integration_type are required' 
      }, { status: 400 });
    }

    if (integration_type === 'calendar') {
      await sql`
        UPDATE calendar_integrations
        SET sync_enabled = false,
            access_token = NULL,
            refresh_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE professional_id = ${professional_id}
      `;
    } else if (integration_type === 'communication') {
      await sql`
        UPDATE communication_integrations
        SET enabled = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE professional_id = ${professional_id}
      `;
    }

    return NextResponse.json({ success: true, message: 'Integration disconnected' });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
  }
}
