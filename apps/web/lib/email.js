export async function sendEmail({ to, subject, text, html }) {
  // Placeholder — no email provider configured yet.
  // Enable Postmark, Resend, or another provider in Integrations to send real emails.
  console.log("[Email] Would send email:");
  console.log("[Email]   To:", to);
  console.log("[Email]   Subject:", subject);
  console.log("[Email]   Body:", text?.substring(0, 100) || html?.substring(0, 100));
  console.log("[Email] Configure an email provider in Integrations to send real emails.");
  
  // In development, return the verification link for testing
  return {
    success: true,
    messageId: `dev-${Date.now()}`,
  };
}

export async function sendVerificationEmail(email, verificationUrl, token) {
  const subject = "Verify your Belize Professional account";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #4f46e5; }
        .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Welcome to Belize Professional!</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1; font-size: 14px;">${verificationUrl}</p>
          
          <div class="warning">
            <strong>⏰ This link will expire in 24 hours</strong><br/>
            For security reasons, this verification link is only valid for 24 hours from the time this email was sent.
          </div>
          
          <p>If you didn't create an account with Belize Professional, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Belize Professional - Professional Practice Management</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Welcome to Belize Professional!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
  `;
  
  console.log("\n=== EMAIL VERIFICATION ===");
  console.log("To:", email);
  console.log("Verification URL:", verificationUrl);
  console.log("Token:", token);
  console.log("========================\n");
  
  return await sendEmail({ to: email, subject, text, html });
}

export async function sendPasswordResetEmail(email, resetUrl, token) {
  const subject = "Reset your Belize Professional password";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #4f46e5; }
        .footer { text-align: center; margin-top: 20px; color: #94a3b8; font-size: 14px; }
        .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your Belize Professional account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6366f1; font-size: 14px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⏰ This link will expire in 24 hours</strong><br/>
            For security reasons, this password reset link is only valid for 24 hours and can only be used once.
          </div>
          
          <p><strong>If you didn't request a password reset,</strong> please ignore this email and your password will remain unchanged. Your account is secure.</p>
        </div>
        <div class="footer">
          <p>Belize Professional - Professional Practice Management</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Password Reset Request

We received a request to reset your password. Click the link below to create a new password:
${resetUrl}

This link will expire in 24 hours and can only be used once.

If you didn't request this, please ignore this email.
  `;
  
  console.log("\n=== PASSWORD RESET ===");
  console.log("To:", email);
  console.log("Reset URL:", resetUrl);
  console.log("Token:", token);
  console.log("====================\n");
  
  return await sendEmail({ to: email, subject, text, html });
}
