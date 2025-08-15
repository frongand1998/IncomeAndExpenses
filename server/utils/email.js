const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

async function sendResetEmail({ provider, to, token, frontendOrigin, from }) {
  assert(to, "Missing 'to' email");
  assert(token, "Missing reset token");
  assert(frontendOrigin, "Missing frontendOrigin");

  const resetUrl = `${frontendOrigin.replace(
    /\/$/,
    ""
  )}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = "Reset your password";
  const html = `
    <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6">
      <h2>Password reset request</h2>
      <p>We received a request to reset your password. Click the button below to set a new password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">Reset Password</a></p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (provider === "sendgrid") {
    const sgMail = require("@sendgrid/mail");
    const apiKey = process.env.SENDGRID_API_KEY;
    assert(apiKey, "Missing SENDGRID_API_KEY");
    const fromEmail = from || process.env.SENDGRID_FROM;
    assert(fromEmail, "Missing SENDGRID_FROM");
    sgMail.setApiKey(apiKey);
    await sgMail.send({ to, from: fromEmail, subject, html });
    return;
  }

  if (provider === "resend") {
    const { Resend } = require("resend");
    const apiKey = process.env.RESEND_API_KEY;
    assert(apiKey, "Missing RESEND_API_KEY");
    const fromEmail = from || process.env.RESEND_FROM;
    assert(fromEmail, "Missing RESEND_FROM");
    const resend = new Resend(apiKey);
    await resend.emails.send({ to, from: fromEmail, subject, html });
    return;
  }

  throw new Error(`Unsupported email provider: ${provider}`);
}

module.exports = { sendResetEmail };
