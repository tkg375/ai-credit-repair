import { firestore } from "@/lib/firebase-admin";

export async function getUserSubscription(userId: string): Promise<{
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  status: string;
}> {
  try {
    const userDoc = await firestore.getDoc("users", userId);
    if (!userDoc) {
      return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null, status: "none" };
    }

    const status = (userDoc.subscriptionStatus as string) || "none";
    const isPro = status === "active" || status === "trialing";

    // Check if period has ended
    const periodEnd = userDoc.currentPeriodEnd as string | null;
    if (isPro && periodEnd && new Date(periodEnd) < new Date()) {
      return { isPro: false, stripeCustomerId: userDoc.stripeCustomerId as string | null, stripeSubscriptionId: userDoc.stripeSubscriptionId as string | null, currentPeriodEnd: periodEnd, status: "expired" };
    }

    return {
      isPro,
      stripeCustomerId: (userDoc.stripeCustomerId as string) || null,
      stripeSubscriptionId: (userDoc.stripeSubscriptionId as string) || null,
      currentPeriodEnd: periodEnd || null,
      status,
    };
  } catch {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null, status: "error" };
  }
}
