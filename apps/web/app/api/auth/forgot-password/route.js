import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';
import crypto from 'crypto';

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
      FROM user 
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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await sql`
      UPDATE user 
      SET 
        reset_token = ${resetToken},
        reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `;

    // Create reset URL - use absolute URL in production
    const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, log it to console (in production, integrate with email service)
    console.log(`Password Reset for ${user.email}:`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);

    // You can integrate with email sending here
    // Example:
    // await fetch('/api/email/send', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     to: user.email,
    //     subject: 'Reset Your Belize Professional Password',
    //     html: `
    //       <h2>Password Reset Request</h2>
    //       <p>Hi ${user.name},</p>
    //       <p>Click the link below to reset your password:</p>
    //       <a href="${resetUrl}">${resetUrl}</a>
    //       <p>This link will expire in 1 hour.</p>
    //       <p>If you didn't request this, please ignore this email.</p>
    //     `
    //   })
    // });

    return NextResponse.json({ 
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Only include these in development
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
