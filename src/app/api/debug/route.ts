import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `set (${process.env.STRIPE_SECRET_KEY.slice(0, 7)}...)` : "MISSING",
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID ? `set (${process.env.STRIPE_PRO_PRICE_ID})` : "MISSING",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? `set (${process.env.STRIPE_WEBHOOK_SECRET.slice(0, 8)}...)` : "MISSING",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  });
}
