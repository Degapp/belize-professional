import { NextResponse } from "next/server";
import sql from "@/app/api/utils/sql";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      );
    }

    // Generate verification token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await sql`
      INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
      VALUES (
        ${crypto.randomUUID()},
        ${email.toLowerCase()},
        ${token},
        ${expiresAt},
        ${new Date()},
        ${new Date()}
      )
    `;

    // Create verification URL
    const baseUrl = process.env.BETTER_AUTH_URL || "https://isu1ju6pgod4ktl6f3wf8.web-preview.appgen.com";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    // Send verification email
    await sendVerificationEmail(email, verificationUrl, token);

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      ...(process.env.NODE_ENV === 'development' && {
        verificationUrl,
        token
      })
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
