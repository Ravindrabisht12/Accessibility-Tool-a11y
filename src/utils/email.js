import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmailNotification({ subject, results }) {
  if (process.env.ENABLE_EMAIL !== "true") {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const html = `
      <h2>${subject}</h2>
      <p>Automated accessibility scan has completed.</p>
      
      <h3>Summary:</h3>
      <ul>
        <li>Sites scanned: ${results.successful}/${results.totalSites}</li>
        <li>Failed: ${results.failed}</li>
        <li>Total violations: ${results.totalViolations}</li>
      </ul>
      
      <p>View detailed reports in your Accessibility Monitor dashboard.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: html,
    });

    console.log("✅ Email notification sent");
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
}
