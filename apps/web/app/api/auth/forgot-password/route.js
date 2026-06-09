import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email, name 
      FROM "user" 
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    const user = users[0];

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store reset token in database
    await sql`
      UPDATE "user"
      SET 
        reset_token = ${resetToken},
        reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `;

    // Create reset URL - use absolute URL
    const baseUrl = process.env.BETTER_AUTH_URL || 'https://isu1ju6pgod4ktl6f3wf8.web-preview.appgen.com';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetUrl, resetToken);

    return NextResponse.json({ 
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Only include these in development for testing
      ...(process.env.NODE_ENV === 'development' && {
        resetUrl,
        resetToken
      })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
