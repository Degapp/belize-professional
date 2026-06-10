import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

// Webhook verification (GET request)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Webhook messages (POST request)
export async function POST(request) {
  try {
    const body = await request.json();

    // Process incoming messages
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value?.messages) {
            for (const message of change.value.messages) {
              await processIncomingMessage(message, change.value);
            }
          }
          
          // Process status updates (delivered, read, etc.)
          if (change.value?.statuses) {
            for (const status of change.value.statuses) {
              await updateMessageStatus(status);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processIncomingMessage(message, value) {
  try {
    const clientPhone = message.from;
    const clientName = value.contacts?.[0]?.profile?.name || '';
    const messageType = message.type;
    let content = '';
    let mediaUrl = '';

    // Extract message content based on type
    switch (messageType) {
      case 'text':
        content = message.text?.body || '';
        break;
      case 'image':
        content = message.image?.caption || '[Image]';
        mediaUrl = message.image?.id || '';
        break;
      case 'video':
        content = message.video?.caption || '[Video]';
        mediaUrl = message.video?.id || '';
        break;
      case 'document':
        content = message.document?.filename || '[Document]';
        mediaUrl = message.document?.id || '';
        break;
      case 'audio':
        content = '[Audio]';
        mediaUrl = message.audio?.id || '';
        break;
      default:
        content = `[${messageType}]`;
    }

    // Save incoming message to database
    await sql`
      INSERT INTO whatsapp_messages (
        message_id, professional_id, client_phone, client_name,
        direction, message_type, content, media_url, status, sent_at
      ) VALUES (
        ${message.id}, 1, ${clientPhone}, ${clientName},
        'received', ${messageType}, ${content}, ${mediaUrl}, 'received', NOW()
      )
      ON CONFLICT (message_id) DO NOTHING
    `;
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

async function updateMessageStatus(status) {
  try {
    const messageId = status.id;
    const statusType = status.status;

    let updateField = '';
    switch (statusType) {
      case 'delivered':
        updateField = 'delivered_at';
        break;
      case 'read':
        updateField = 'read_at';
        break;
      default:
        return;
    }

    if (updateField) {
      await sql`
        UPDATE whatsapp_messages
        SET status = ${statusType}, ${sql([updateField])} = NOW()
        WHERE message_id = ${messageId}
      `;
    }
  } catch (error) {
    console.error('Error updating message status:', error);
  }
}
