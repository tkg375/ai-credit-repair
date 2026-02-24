import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    console.error("[checkout] Auth failed — no user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env["STRIPE_PRO_PRICE_ID"];
  if (!priceId) {
    console.error("[checkout] STRIPE_PRO_PRICE_ID is not set");
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  if (!process.env["STRIPE_SECRET_KEY"]) {
    console.error("[checkout] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    // Check if user already has a Stripe customer ID
    const userDoc = await firestore.getDoc("users", user.uid);
    let customerId = userDoc?.data?.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { firebaseUid: user.uid },
      });
      customerId = customer.id;
      await firestore.updateDoc("users", user.uid, {
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      customer_update: { name: "auto", address: "auto" },
      line_items: [{ price: priceId as string, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://credit-800.com"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://credit-800.com"}/pricing`,
      metadata: { firebaseUid: user.uid },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[checkout] Stripe error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
