import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id') || 1;

    const messages = await sql`
      SELECT * FROM whatsapp_messages 
      WHERE professional_id = ${professionalId}
      ORDER BY sent_at DESC
      LIMIT 100
    `;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { client_phone, client_name, content, professional_id = 1 } = await request.json();

    if (!client_phone || !content) {
      return NextResponse.json({ error: 'Phone number and message content are required' }, { status: 400 });
    }

    // Send message via WhatsApp Business API
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ error: 'WhatsApp credentials not configured' }, { status: 500 });
    }

    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: client_phone.replace(/[^\d+]/g, ''),
        type: 'text',
        text: {
          body: content
        }
      })
    });

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappData);
      return NextResponse.json({ error: whatsappData.error?.message || 'Failed to send message' }, { status: 500 });
    }

    // Save message to database
    const [message] = await sql`
      INSERT INTO whatsapp_messages (
        message_id, professional_id, client_phone, client_name, 
        direction, content, status, sent_at
      ) VALUES (
        ${whatsappData.messages[0].id}, ${professional_id}, ${client_phone}, 
        ${client_name || ''}, 'sent', ${content}, 'sent', NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
