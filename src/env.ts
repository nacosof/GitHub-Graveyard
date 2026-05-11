import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    GITHUB_TOKEN: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().trim().email().max(320).optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    SMTP_FROM: z.string().trim().email().max(320).optional(),
    APP_NAME: z.string().min(1).optional(),
    ADMIN_GMAIL: z.string().trim().email().max(320).optional(),
    ADMIN_LOGIN: z.string().trim().min(3).max(24).optional(),
    ADMIN_PASSWORD: z.string().min(1).optional(),

    // Payments (NOWPayments)
    NOWPAYMENT_TOKEN: z.string().min(1).optional(),
    NOWPAYMENTS_API_KEY: z.string().min(1).optional(),
    NOWPAYMENTS_IPN_SECRET: z.string().min(1).optional(),
    NOWPAYMENTS_IPN_URL: z.string().url().optional(),
    NOWPAYMENTS_PRICE_CURRENCY: z.string().min(1).optional(), // e.g. "usd"
    NOWPAYMENTS_PAY_CURRENCY: z.string().min(1).optional(), // e.g. "usdttrc20"

    // Dev toggles
    DEV_CANDLES_TOPUP_CREDIT: z
      .enum(["0", "1", "true", "false"])
      .optional()
      .transform((v) => (v ? v === "1" || v === "true" : false)),
  },
  client: {},
  runtimeEnv: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    APP_NAME: process.env.APP_NAME,
    ADMIN_GMAIL: process.env.ADMIN_GMAIL,
    ADMIN_LOGIN: process.env.ADMIN_LOGIN,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

    NOWPAYMENT_TOKEN: process.env.NOWPAYMENT_TOKEN,
    NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY,
    NOWPAYMENTS_IPN_SECRET: process.env.NOWPAYMENTS_IPN_SECRET,
    NOWPAYMENTS_IPN_URL: process.env.NOWPAYMENTS_IPN_URL,
    NOWPAYMENTS_PRICE_CURRENCY: process.env.NOWPAYMENTS_PRICE_CURRENCY,
    NOWPAYMENTS_PAY_CURRENCY: process.env.NOWPAYMENTS_PAY_CURRENCY,

    DEV_CANDLES_TOPUP_CREDIT: process.env.DEV_CANDLES_TOPUP_CREDIT,
  },
});
