import { NextResponse } from 'next/server';
import sql from '@/app/api/utils/sql';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const users = await sql`
      SELECT id, email, reset_token_expiry 
      FROM user 
      WHERE reset_token = ${token}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users[0];

    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expiry)) {
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password (Better Auth uses bcrypt internally)
    // For Better Auth compatibility, we need to hash with bcrypt
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await sql`
      UPDATE user 
      SET 
        password = ${hashedPassword},
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
