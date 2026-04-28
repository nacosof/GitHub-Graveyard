import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";

export async function GET() {
  const locale = await getLocale();
  return NextResponse.json({ locale });
}
