const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 587;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials are not configured in your backend .env file (SMTP_USER/EMAIL_USER and SMTP_PASS/EMAIL_PASS are required).');
    console.log('--- MOCK EMAIL START ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body (HTML):', html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('--- MOCK EMAIL END ---');
    return { success: false, reason: 'SMTP credentials missing' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: `"My Travel Bandhu" <${user}>`,
      to,
      subject,
      html,
    });

    console.log('✉️ Email sent successfully:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
