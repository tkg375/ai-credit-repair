import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { firestore } from "@/lib/firebase-admin";
import { sendNewSubscriberNotification, sendProUpgradeEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUid;
        if (uid && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await firestore.updateDoc("users", uid, {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000).toISOString() }),
          });

          // Handle referral reward: only credit referrer when referred user actually subscribes
          const userDoc = await firestore.getDoc("users", uid);
          const referredBy = userDoc?.data?.referredBy as string | undefined;
          const referralDiscountUsed = userDoc?.data?.referralDiscountUsed as boolean | undefined;
          if (referredBy && !referralDiscountUsed) {
            // Mark discount as used for this subscriber
            await firestore.updateDoc("users", uid, { referralDiscountUsed: true });

            // Increment referrer's rewards count
            const referrals = await firestore.query("referrals", [
              { field: "referralCode", op: "EQUAL", value: referredBy },
            ]);
            if (referrals.length > 0) {
              const referral = referrals[0];
              await firestore.updateDoc("referrals", referral.id, {
                rewards: (referral.data.rewards as number || 0) + 1,
              });
            }
          }
        }
        const subscriberEmail = session.customer_details?.email || "unknown";
        const amount = session.amount_total ?? 1999;
        // Email the customer a confirmation
        if (session.customer_details?.email) {
          await sendProUpgradeEmail(session.customer_details.email, amount);
        }
        // Notify owner
        await sendNewSubscriberNotification(subscriberEmail, amount);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const uid = customer.metadata?.firebaseUid;
        if (uid) {
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await firestore.updateDoc("users", uid, {
            subscriptionStatus: subscription.status,
            ...(periodEnd && { currentPeriodEnd: new Date(periodEnd * 1000).toISOString() }),
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const uid = customer.metadata?.firebaseUid;
        if (uid) {
          await firestore.updateDoc("users", uid, {
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        const uid = customer.metadata?.firebaseUid;
        if (uid) {
          await firestore.updateDoc("users", uid, {
            subscriptionStatus: "past_due",
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }

  return NextResponse.json({ received: true });
}
