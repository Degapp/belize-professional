import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id is required' }, { status: 400 });
    }

    // Total time and revenue
    let totals;
    if (startDate && endDate) {
      [totals] = await sql`
        SELECT 
          COALESCE(SUM(hours_worked), 0) as total_hours,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN invoiced = true THEN total_amount ELSE 0 END), 0) as invoiced_revenue,
          COALESCE(SUM(CASE WHEN invoiced = false AND billable = true THEN total_amount ELSE 0 END), 0) as unbilled_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at BETWEEN ${startDate} AND ${endDate}
      `;
    } else if (startDate) {
      [totals] = await sql`
        SELECT 
          COALESCE(SUM(hours_worked), 0) as total_hours,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN invoiced = true THEN total_amount ELSE 0 END), 0) as invoiced_revenue,
          COALESCE(SUM(CASE WHEN invoiced = false AND billable = true THEN total_amount ELSE 0 END), 0) as unbilled_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at >= ${startDate}
      `;
    } else if (endDate) {
      [totals] = await sql`
        SELECT 
          COALESCE(SUM(hours_worked), 0) as total_hours,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN invoiced = true THEN total_amount ELSE 0 END), 0) as invoiced_revenue,
          COALESCE(SUM(CASE WHEN invoiced = false AND billable = true THEN total_amount ELSE 0 END), 0) as unbilled_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at <= ${endDate}
      `;
    } else {
      [totals] = await sql`
        SELECT 
          COALESCE(SUM(hours_worked), 0) as total_hours,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN invoiced = true THEN total_amount ELSE 0 END), 0) as invoiced_revenue,
          COALESCE(SUM(CASE WHEN invoiced = false AND billable = true THEN total_amount ELSE 0 END), 0) as unbilled_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
      `;
    }

    // Hours by client
    let clientBreakdown;
    if (startDate && endDate) {
      clientBreakdown = await sql`
        SELECT 
          c.id,
          c.full_name,
          COALESCE(SUM(te.hours_worked), 0) as total_hours,
          COALESCE(SUM(te.total_amount), 0) as total_revenue,
          COUNT(te.id) as entry_count
        FROM clients c
        JOIN time_entries te ON c.id = te.client_id
        WHERE te.professional_id = ${professionalId}
        AND te.started_at BETWEEN ${startDate} AND ${endDate}
        GROUP BY c.id, c.full_name
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    } else if (startDate) {
      clientBreakdown = await sql`
        SELECT 
          c.id,
          c.full_name,
          COALESCE(SUM(te.hours_worked), 0) as total_hours,
          COALESCE(SUM(te.total_amount), 0) as total_revenue,
          COUNT(te.id) as entry_count
        FROM clients c
        JOIN time_entries te ON c.id = te.client_id
        WHERE te.professional_id = ${professionalId}
        AND te.started_at >= ${startDate}
        GROUP BY c.id, c.full_name
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    } else if (endDate) {
      clientBreakdown = await sql`
        SELECT 
          c.id,
          c.full_name,
          COALESCE(SUM(te.hours_worked), 0) as total_hours,
          COALESCE(SUM(te.total_amount), 0) as total_revenue,
          COUNT(te.id) as entry_count
        FROM clients c
        JOIN time_entries te ON c.id = te.client_id
        WHERE te.professional_id = ${professionalId}
        AND te.started_at <= ${endDate}
        GROUP BY c.id, c.full_name
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    } else {
      clientBreakdown = await sql`
        SELECT 
          c.id,
          c.full_name,
          COALESCE(SUM(te.hours_worked), 0) as total_hours,
          COALESCE(SUM(te.total_amount), 0) as total_revenue,
          COUNT(te.id) as entry_count
        FROM clients c
        JOIN time_entries te ON c.id = te.client_id
        WHERE te.professional_id = ${professionalId}
        GROUP BY c.id, c.full_name
        ORDER BY total_revenue DESC
        LIMIT 10
      `;
    }

    // Daily time tracking (last 30 days)
    const dailyTrend = await sql`
      SELECT 
        DATE(started_at) as date,
        COALESCE(SUM(hours_worked), 0) as hours,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as entries
      FROM time_entries
      WHERE professional_id = ${professionalId}
      AND started_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `;

    // Billable vs non-billable breakdown
    let billableBreakdown;
    if (startDate && endDate) {
      [billableBreakdown] = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN billable = true THEN hours_worked ELSE 0 END), 0) as billable_hours,
          COALESCE(SUM(CASE WHEN billable = false THEN hours_worked ELSE 0 END), 0) as non_billable_hours,
          COALESCE(SUM(CASE WHEN billable = true THEN total_amount ELSE 0 END), 0) as billable_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at BETWEEN ${startDate} AND ${endDate}
      `;
    } else if (startDate) {
      [billableBreakdown] = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN billable = true THEN hours_worked ELSE 0 END), 0) as billable_hours,
          COALESCE(SUM(CASE WHEN billable = false THEN hours_worked ELSE 0 END), 0) as non_billable_hours,
          COALESCE(SUM(CASE WHEN billable = true THEN total_amount ELSE 0 END), 0) as billable_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at >= ${startDate}
      `;
    } else if (endDate) {
      [billableBreakdown] = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN billable = true THEN hours_worked ELSE 0 END), 0) as billable_hours,
          COALESCE(SUM(CASE WHEN billable = false THEN hours_worked ELSE 0 END), 0) as non_billable_hours,
          COALESCE(SUM(CASE WHEN billable = true THEN total_amount ELSE 0 END), 0) as billable_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
        AND started_at <= ${endDate}
      `;
    } else {
      [billableBreakdown] = await sql`
        SELECT 
          COALESCE(SUM(CASE WHEN billable = true THEN hours_worked ELSE 0 END), 0) as billable_hours,
          COALESCE(SUM(CASE WHEN billable = false THEN hours_worked ELSE 0 END), 0) as non_billable_hours,
          COALESCE(SUM(CASE WHEN billable = true THEN total_amount ELSE 0 END), 0) as billable_revenue,
          COALESCE(SUM(CASE WHEN billable = false THEN total_amount ELSE 0 END), 0) as non_billable_revenue
        FROM time_entries
        WHERE professional_id = ${professionalId}
      `;
    }

    // Utilization rate (billable hours / total hours)
    const utilizationRate = totals.total_hours > 0 
      ? (parseFloat(billableBreakdown.billable_hours) / parseFloat(totals.total_hours)) * 100 
      : 0;

    return NextResponse.json({
      summary: {
        total_hours: parseFloat(totals.total_hours),
        total_revenue: parseFloat(totals.total_revenue),
        invoiced_revenue: parseFloat(totals.invoiced_revenue),
        unbilled_revenue: parseFloat(totals.unbilled_revenue),
        non_billable_revenue: parseFloat(totals.non_billable_revenue),
        billable_hours: parseFloat(billableBreakdown.billable_hours),
        non_billable_hours: parseFloat(billableBreakdown.non_billable_hours),
        utilization_rate: utilizationRate
      },
      client_breakdown: clientBreakdown,
      daily_trend: dailyTrend
    });
  } catch (error) {
    console.error('Error fetching time billing analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
