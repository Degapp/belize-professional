import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('user_id');

    // If userId is provided, return only that user's professionals
    if (userId) {
      const professionals = await sql`
        SELECT p.* 
        FROM professionals p
        JOIN "user" u ON u.email = p.email
        WHERE u.id = ${userId}
      `;
      return NextResponse.json({ professionals });
    }

    // Otherwise, return all professionals, optionally filtered by category
    let professionals;
    if (category && category !== 'all') {
      professionals = await sql`
        SELECT * FROM professionals 
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
    } else {
      professionals = await sql`
        SELECT * FROM professionals 
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}
