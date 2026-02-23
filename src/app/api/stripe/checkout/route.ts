import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check if user already has a Stripe customer ID
    const userDoc = await firestore.getDoc("users", user.uid);
    let customerId = userDoc?.data?.stripeCustomerId as string | undefined;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { firebaseUid: user.uid },
      });
      customerId = customer.id;

      // Save customer ID to Firestore
      await firestore.updateDoc("users", user.uid, {
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      customer_update: { name: "auto", address: "auto" },
      line_items: [
        {
          price: PLANS.pro.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://credit-800.com"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://credit-800.com"}/pricing`,
      metadata: {
        firebaseUid: user.uid,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
