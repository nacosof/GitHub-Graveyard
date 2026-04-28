import nodemailer from "nodemailer";
import { Resend } from "resend";

import { env } from "@/env";

function getSmtpTransport() {
  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT ?? 587;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;

  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

function fromAddress() {
  return env.RESEND_FROM ?? env.SMTP_FROM ?? "no-reply@example.com";
}

function appName() {
  return env.APP_NAME ?? "GitHub Graveyard";
}

export async function sendEmailCode(params: {
  to: string;
  purpose: "verify" | "reset";
  code: string;
}) {
  const subject =
    params.purpose === "verify"
      ? `${appName()}: verification code`
      : `${appName()}: password reset code`;

  const text =
    params.purpose === "verify"
      ? `Your verification code is: ${params.code}\n\nIf you didn't request this, you can safely ignore this email.`
      : `Your password reset code is: ${params.code}\n\nIf you didn't request this, you can safely ignore this email.`;

  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: fromAddress(),
      to: params.to,
      subject,
      text,
    });
    return { ok: true as const, skipped: false as const, provider: "resend" as const };
  }

  const transport = getSmtpTransport();
  if (!transport) {
    return { ok: false as const, skipped: true as const };
  }

  await transport.sendMail({ from: fromAddress(), to: params.to, subject, text });

  return { ok: true as const, skipped: false as const, provider: "smtp" as const };
}
