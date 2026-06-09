import { NextResponse } from "next/server";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find verification record
    const verifications = await sql`
      SELECT * FROM verification 
      WHERE value = ${token}
      LIMIT 1
    `;

    if (verifications.length === 0) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    const verification = verifications[0];

    // Check if token is expired (24 hours)
    const expiresAt = new Date(verification.expiresat);
    const now = new Date();
    
    if (now > expiresAt) {
      // Delete expired token
      await sql`DELETE FROM verification WHERE id = ${verification.id}`;
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Update user's emailVerified status
    const users = await sql`
      UPDATE "user"
      SET "emailVerified" = true
      WHERE email = ${verification.identifier}
      RETURNING id, email, name
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the verification token (one-time use)
    await sql`DELETE FROM verification WHERE id = ${verification.id}`;

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
