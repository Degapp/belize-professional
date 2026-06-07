import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const [appointment] = await sql`
      SELECT 
        a.*,
        c.full_name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.id = ${id}
    `;
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      start_at, 
      end_at, 
      location_type, 
      location_details,
      status
    } = body;

    const [appointment] = await sql`
      UPDATE appointments
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        start_at = COALESCE(${start_at}, start_at),
        end_at = COALESCE(${end_at}, end_at),
        location_type = COALESCE(${location_type}, location_type),
        location_details = COALESCE(${location_details}, location_details),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await sql`DELETE FROM appointments WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
