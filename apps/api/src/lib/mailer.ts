import nodemailer from "nodemailer";
import { env } from "./env";

export async function sendEmail(to: string, subject: string, text: string) {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.EMAIL_FROM) {
    // For MVP/dev, just log.
    console.log(`[email] To: ${to} Subject: ${subject}\n${text}`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });

  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text
  });
}
