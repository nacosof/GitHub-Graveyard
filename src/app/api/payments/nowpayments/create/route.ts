import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { getUserFromCookie } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { nowPaymentsCreateInvoice } from "@/server/payments/nowpayments";

const BodySchema = z.object({
  amount: z.coerce.number().int().min(15).max(1000),
});

export async function POST(req: Request) {
  const user = await getUserFromCookie();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({
    where: { username: user.username },
    select: { id: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const amountCandles = parsed.data.amount;
  const priceCurrency = (env.NOWPAYMENTS_PRICE_CURRENCY ?? "usd").toLowerCase();
  const payCurrency = (env.NOWPAYMENTS_PAY_CURRENCY ?? "usdttrc20").toLowerCase();
  const ipnCallbackUrl = env.NOWPAYMENTS_IPN_URL;
  const origin = new URL(req.url).origin;

  const topup = await prisma.candleTopup.create({
    data: {
      userId: dbUser.id,
      amountCandles,
      provider: "nowpayments",
      status: "created",
    },
    select: { id: true },
  });

  const invoice = await nowPaymentsCreateInvoice({
    price_amount: amountCandles,
    price_currency: priceCurrency,
    pay_currency: payCurrency,
    order_id: topup.id,
    order_description: `Top up candles: ${amountCandles}`,
    ipn_callback_url: ipnCallbackUrl,
    success_url: `${origin}/`,
    cancel_url: `${origin}/`,
  });

  await prisma.candleTopup.update({
    where: { id: topup.id },
    data: {
      providerRef: String(invoice.id),
      status: "invoice_created",
      paymentUrl: invoice.invoice_url ?? null,
      raw: invoice as unknown as object,
    },
  });

  if (!invoice.invoice_url) {
    return NextResponse.json({ error: "Missing payment_url" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, payment_url: invoice.invoice_url });
}

