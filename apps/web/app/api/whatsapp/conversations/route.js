import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id') || 1;

    // Get unique conversations with latest message and unread count
    const conversations = await sql`
      WITH ranked_messages AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (PARTITION BY client_phone ORDER BY sent_at DESC) as rn
        FROM whatsapp_messages
        WHERE professional_id = ${professionalId}
      )
      SELECT 
        client_phone,
        client_name,
        content as last_message,
        sent_at as last_message_at,
        direction,
        (
          SELECT COUNT(*) 
          FROM whatsapp_messages 
          WHERE client_phone = rm.client_phone 
            AND professional_id = ${professionalId}
            AND direction = 'received' 
            AND read_at IS NULL
        ) as unread_count
      FROM ranked_messages rm
      WHERE rn = 1
      ORDER BY sent_at DESC
    `;

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
