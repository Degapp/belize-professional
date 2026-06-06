import sql from "@/app/api/utils/sql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { full_name, email, password, role, phone, company_name, logo_url } = body;

    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    // Validate role is allowed
    const allowedRoles = ['admin', 'professional', 'staff'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid professional type selected' }, { status: 400 });
    }

    // Simple password hash (in production, use bcrypt)
    const password_hash = password;

    const [user] = await sql`
      INSERT INTO users (full_name, email, password_hash, role, phone, company_name, logo_url)
      VALUES (${full_name}, ${email}, ${password_hash}, ${role}, ${phone || null}, ${company_name || null}, ${logo_url || null})
      RETURNING *
    `;

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    // Hide internal database errors from users
    console.error('Signup error:', error);
    
    // Check for common database errors
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    
    if (error.message?.includes('check constraint')) {
      return NextResponse.json({ error: 'Invalid account information. Please check your details and try again.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 500 });
  }
}