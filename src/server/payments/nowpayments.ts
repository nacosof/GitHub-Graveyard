import crypto from "crypto";

import { env } from "@/env";

type JsonRecord = Record<string, unknown>;

function sortObject(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  return Object.keys(obj as JsonRecord)
    .sort()
    .reduce<JsonRecord>((acc, key) => {
      acc[key] = sortObject((obj as JsonRecord)[key]);
      return acc;
    }, {});
}

export function getNowPaymentsApiKey(): string {
  const key = env.NOWPAYMENTS_API_KEY ?? env.NOWPAYMENT_TOKEN;
  if (!key) throw new Error("Missing NOWPayments API key");
  return key;
}

export function getNowPaymentsIpnSecret(): string {
  const secret = env.NOWPAYMENTS_IPN_SECRET ?? env.NOWPAYMENT_TOKEN;
  if (!secret) throw new Error("Missing NOWPayments IPN secret");
  return secret;
}

export function verifyNowPaymentsSignature(payload: unknown, headerSig: string | null): boolean {
  if (!headerSig) return false;
  const secret = getNowPaymentsIpnSecret();
  const sorted = sortObject(payload);
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(JSON.stringify(sorted));
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerSig));
  } catch {
    return false;
  }
}

export type NowPaymentsCreatePaymentResponse = {
  payment_id: number;
  payment_status: string;
  pay_address?: string | null;
  payment_url?: string | null;
};

export type NowPaymentsCreateInvoiceResponse = {
  id: number;
  order_id: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
};

export async function nowPaymentsCreatePayment(input: {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url?: string;
}): Promise<NowPaymentsCreatePaymentResponse> {
  const apiKey = getNowPaymentsApiKey();
  const res = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(input),
  });

  const rawText = await res.text().catch(() => "");
  const data = (rawText ? (JSON.parse(rawText) as unknown) : null) as unknown;
  if (!res.ok || !data || typeof data !== "object") {
    const details = rawText ? `: ${rawText}` : "";
    throw new Error(`NOWPayments create payment failed (${res.status})${details}`);
  }

  return data as NowPaymentsCreatePaymentResponse;
}

export async function nowPaymentsCreateInvoice(input: {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url: string;
  cancel_url: string;
}): Promise<NowPaymentsCreateInvoiceResponse> {
  const apiKey = getNowPaymentsApiKey();
  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(input),
  });

  const rawText = await res.text().catch(() => "");
  const data = (rawText ? (JSON.parse(rawText) as unknown) : null) as unknown;
  if (!res.ok || !data || typeof data !== "object") {
    const details = rawText ? `: ${rawText}` : "";
    throw new Error(`NOWPayments create invoice failed (${res.status})${details}`);
  }

  return data as NowPaymentsCreateInvoiceResponse;
}

