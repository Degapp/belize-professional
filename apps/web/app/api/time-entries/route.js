import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const clientId = searchParams.get('client_id');
    const invoiced = searchParams.get('invoiced');
    const billable = searchParams.get('billable');

    let entries;
    
    if (professionalId && clientId && invoiced !== null) {
      entries = await sql`
        SELECT te.*, c.full_name as client_name 
        FROM time_entries te
        LEFT JOIN clients c ON te.client_id = c.id
        WHERE te.professional_id = ${professionalId} 
        AND te.client_id = ${clientId}
        AND te.invoiced = ${invoiced === 'true'}
        ORDER BY te.started_at DESC
      `;
    } else if (professionalId && invoiced !== null) {
      entries = await sql`
        SELECT te.*, c.full_name as client_name 
        FROM time_entries te
        LEFT JOIN clients c ON te.client_id = c.id
        WHERE te.professional_id = ${professionalId}
        AND te.invoiced = ${invoiced === 'true'}
        ORDER BY te.started_at DESC
      `;
    } else if (professionalId) {
      entries = await sql`
        SELECT te.*, c.full_name as client_name 
        FROM time_entries te
        LEFT JOIN clients c ON te.client_id = c.id
        WHERE te.professional_id = ${professionalId}
        ORDER BY te.started_at DESC
      `;
    } else {
      entries = await sql`
        SELECT te.*, c.full_name as client_name 
        FROM time_entries te
        LEFT JOIN clients c ON te.client_id = c.id
        ORDER BY te.started_at DESC
      `;
    }

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      professional_id,
      client_id,
      case_id,
      description,
      started_at,
      ended_at,
      hourly_rate,
      billable
    } = data;

    if (!professional_id || !client_id || !started_at || !hourly_rate) {
      return NextResponse.json({ 
        error: 'professional_id, client_id, started_at, and hourly_rate are required' 
      }, { status: 400 });
    }

    // Calculate hours worked
    let hoursWorked = 0;
    let totalAmount = 0;

    if (ended_at) {
      const start = new Date(started_at);
      const end = new Date(ended_at);
      hoursWorked = (end - start) / (1000 * 60 * 60); // Convert to hours
      totalAmount = hoursWorked * hourly_rate;
    }

    const [entry] = await sql`
      INSERT INTO time_entries (
        professional_id, client_id, case_id, description, started_at, ended_at,
        hours_worked, hourly_rate, total_amount, billable
      ) VALUES (
        ${professional_id}, ${client_id}, ${case_id || null}, ${description || ''},
        ${started_at}, ${ended_at || null}, ${hoursWorked}, ${hourly_rate},
        ${totalAmount}, ${billable !== false}
      ) RETURNING *
    `;

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}
