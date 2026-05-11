import { NextResponse } from "next/server";

import { prisma } from "@/server/db";
import { verifyNowPaymentsSignature } from "@/server/payments/nowpayments";

type IpnPayload = {
  payment_id?: number | string;
  payment_status?: string;
  order_id?: string | null;
  price_amount?: number | string;
  price_currency?: string;
};

function normalizeStatus(s: unknown): string {
  if (typeof s !== "string") return "unknown";
  return s.trim().toLowerCase();
}

function isCreditableStatus(status: string) {
  return status === "finished" || status === "confirmed";
}

export async function POST(req: Request) {
  const sig = req.headers.get("x-nowpayments-sig");
  const payload = (await req.json().catch(() => null)) as IpnPayload | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  if (!verifyNowPaymentsSignature(payload, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const status = normalizeStatus(payload.payment_status);
  const providerRef = payload.payment_id != null ? String(payload.payment_id) : null;
  const orderId = typeof payload.order_id === "string" ? payload.order_id : null;

  const topup =
    (providerRef
      ? await prisma.candleTopup.findFirst({
          where: { provider: "nowpayments", providerRef },
          select: { id: true, userId: true, amountCandles: true, creditedAt: true },
        })
      : null) ??
    (orderId
      ? await prisma.candleTopup.findUnique({
          where: { id: orderId },
          select: { id: true, userId: true, amountCandles: true, creditedAt: true },
        })
      : null);

  if (!topup) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await prisma.candleTopup.update({
    where: { id: topup.id },
    data: {
      status,
      providerRef: providerRef ?? undefined,
      raw: payload as unknown as object,
    },
  });

  if (!isCreditableStatus(status)) {
    return NextResponse.json({ ok: true, status });
  }

  if (topup.creditedAt) {
    return NextResponse.json({ ok: true, status, alreadyCredited: true });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: topup.userId },
      data: { candles: { increment: topup.amountCandles } },
    }),
    prisma.candleTopup.update({
      where: { id: topup.id },
      data: { creditedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, status, credited: true });
}

