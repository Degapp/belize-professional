import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [entry] = await sql`
      SELECT te.*, c.full_name as client_name 
      FROM time_entries te
      LEFT JOIN clients c ON te.client_id = c.id
      WHERE te.id = ${id}
    `;

    if (!entry) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching time entry:', error);
    return NextResponse.json({ error: 'Failed to fetch time entry' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const {
      description,
      started_at,
      ended_at,
      hourly_rate,
      billable,
      invoiced,
      invoice_id
    } = data;

    // Recalculate if times or rate changed
    let updateFields = {};
    
    if (started_at !== undefined || ended_at !== undefined || hourly_rate !== undefined) {
      const [current] = await sql`SELECT * FROM time_entries WHERE id = ${id}`;
      
      const start = new Date(started_at || current.started_at);
      const end = ended_at || current.ended_at ? new Date(ended_at || current.ended_at) : null;
      const rate = hourly_rate || current.hourly_rate;
      
      if (end) {
        const hoursWorked = (end - start) / (1000 * 60 * 60);
        const totalAmount = hoursWorked * rate;
        
        updateFields.hours_worked = hoursWorked;
        updateFields.total_amount = totalAmount;
      }
    }

    const [updated] = await sql`
      UPDATE time_entries 
      SET 
        description = COALESCE(${description}, description),
        started_at = COALESCE(${started_at}, started_at),
        ended_at = COALESCE(${ended_at}, ended_at),
        hourly_rate = COALESCE(${hourly_rate}, hourly_rate),
        hours_worked = COALESCE(${updateFields.hours_worked}, hours_worked),
        total_amount = COALESCE(${updateFields.total_amount}, total_amount),
        billable = COALESCE(${billable}, billable),
        invoiced = COALESCE(${invoiced}, invoiced),
        invoice_id = COALESCE(${invoice_id}, invoice_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating time entry:', error);
    return NextResponse.json({ error: 'Failed to update time entry' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM time_entries WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json({ error: 'Failed to delete time entry' }, { status: 500 });
  }
}
