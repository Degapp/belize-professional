import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // First, get the user record to find their integer ID
    const [userRecord] = await sql`
      SELECT id FROM "user" WHERE id = ${userId}
    `;

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Now get the professional record - note that professionals.user_id is an integer
    // We need to handle the case where Better Auth user.id is a string
    // For now, let's just query all professionals and match by email
    const professionals = await sql`
      SELECT p.* 
      FROM professionals p
      JOIN "user" u ON u.email = p.email
      WHERE u.id = ${userId}
    `;

    return NextResponse.json({ professionals });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Failed to fetch professionals' }, { status: 500 });
  }
}
