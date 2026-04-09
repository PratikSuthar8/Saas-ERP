import nodemailer from 'nodemailer';

// For development - using ethereal.email (fake SMTP for testing)
// No real email needed - creates a preview URL
export const sendResetEmail = async (to: string, resetToken: string) => {
  // Create test account (only once)
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  
  const info = await transporter.sendMail({
    from: '"ERP SaaS" <noreply@erp-saas.com>',
    to: to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to create a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy this link: <span style="color: #4f46e5;">${resetUrl}</span></p>
        <p>This link expires in 1 hour.</p>
        <hr style="margin: 30px 0; border-color: #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
  
  // For development, log the preview URL
  console.log('í³§ Email preview URL:', nodemailer.getTestMessageUrl(info));
  
  return nodemailer.getTestMessageUrl(info);
};
