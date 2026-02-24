import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { firestore } from "@/lib/firebase-admin";
import Stripe from "stripe";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userDoc = await firestore.getDoc("users", user.uid);
    const customerId = userDoc?.data?.stripeCustomerId as string | undefined;
    const subscriptionId = userDoc?.data?.stripeSubscriptionId as string | undefined;

    if (!subscriptionId || !customerId) {
      // Fall back to manually-set subscription status in Firestore
      const manualStatus = userDoc?.data?.subscriptionStatus as string | undefined;
      const isPro = manualStatus === "active" || manualStatus === "trialing";
      return NextResponse.json({
        plan: isPro ? "pro" : "free",
        status: manualStatus ?? "none",
        subscription: null,
      });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice"],
    }) as unknown as Stripe.Subscription & { current_period_end: number };

    const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | null;
    const card = paymentMethod?.card;

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;

    return NextResponse.json({
      plan: subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free",
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      amount: subscription.items.data[0]?.price?.unit_amount ?? 1999,
      currency: subscription.items.data[0]?.price?.currency ?? "usd",
      paymentMethod: card
        ? {
            brand: card.brand,
            last4: card.last4,
            expMonth: card.exp_month,
            expYear: card.exp_year,
          }
        : null,
      lastInvoiceAmount: latestInvoice?.amount_paid ?? null,
      lastInvoiceDate: latestInvoice?.created
        ? new Date(latestInvoice.created * 1000).toISOString()
        : null,
    });
  } catch (err) {
    console.error("Failed to fetch subscription:", err);
    return NextResponse.json({ plan: "free", status: "error", subscription: null });
  }
}
