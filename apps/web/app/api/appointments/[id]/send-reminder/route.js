import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reminder_id } = body;
    
    // Get the reminder details
    const [reminder] = await sql`
      SELECT r.*, 
             a.title as appointment_title,
             a.start_at,
             a.end_at,
             a.location_type,
             a.location_details,
             c.full_name as client_name,
             c.email as client_email,
             c.phone as client_phone,
             p.display_name as professional_name,
             p.email as professional_email,
             p.phone as professional_phone
      FROM reminders r
      JOIN appointments a ON r.appointment_id = a.id
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN professionals p ON a.professional_id = p.id
      WHERE r.id = ${reminder_id} AND a.id = ${id}
    `;
    
    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    
    // In production, integrate with actual communication services:
    // - Email: Use Resend, SendGrid, or AWS SES
    // - WhatsApp: Use Twilio WhatsApp API or official WhatsApp Business API
    // - SMS: Use Twilio SMS
    
    // For now, we'll simulate sending and update the status
    const recipientEmail = reminder.recipient_type === 'client' 
      ? reminder.client_email 
      : reminder.professional_email;
      
    const recipientPhone = reminder.recipient_type === 'client'
      ? reminder.client_phone
      : reminder.professional_phone;
    
    console.log(`[REMINDER SIMULATION]`);
    console.log(`Channel: ${reminder.channel}`);
    console.log(`Recipient Type: ${reminder.recipient_type}`);
    console.log(`To: ${reminder.channel === 'email' ? recipientEmail : recipientPhone}`);
    console.log(`Message:\n${reminder.message}`);
    console.log(`---`);
    
    // Update reminder status to sent
    const [updatedReminder] = await sql`
      UPDATE reminders
      SET status = 'sent', sent_at = NOW()
      WHERE id = ${reminder_id}
      RETURNING *
    `;
    
    return NextResponse.json({
      success: true,
      reminder: updatedReminder,
      simulation: {
        channel: reminder.channel,
        recipient_type: reminder.recipient_type,
        recipient: reminder.channel === 'email' ? recipientEmail : recipientPhone
      }
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminder',
      details: error.message 
    }, { status: 500 });
  }
}
