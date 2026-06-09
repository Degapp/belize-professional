import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const users = await sql`
      SELECT id, email, reset_token_expiry 
      FROM "user" 
      WHERE reset_token = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token is expired (24 hours)
    const tokenExpiry = new Date(user.reset_token_expiry);
    const now = new Date();
    
    if (now > tokenExpiry) {
      // Clear expired token
      await sql`
        UPDATE "user"
        SET reset_token = NULL, reset_token_expiry = NULL
        WHERE id = ${user.id}
      `;
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the account table (Better Auth stores passwords there)
    // and clear reset token
    await sql`
      UPDATE account
      SET password = ${hashedPassword}
      WHERE "userId" = ${user.id}
    `;

    await sql`
      UPDATE "user"
      SET 
        reset_token = NULL,
        reset_token_expiry = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
