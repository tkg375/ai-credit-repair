import { firestore } from "./firebase-admin";

export type PlanTier = "none" | "pro" | "autopilot";

export interface SubscriptionInfo {
  plan: PlanTier;
  /** True for both pro and autopilot subscribers */
  isPro: boolean;
  isAutopilot: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  status: string;
}

export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const userDoc = await firestore.getDoc("users", userId);
    if (!userDoc?.exists) {
      return { plan: "none", isPro: false, isAutopilot: false, stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null, status: "none" };
    }

    const status = (userDoc.data.subscriptionStatus as string) || "none";
    const isActive = status === "active" || status === "trialing";

    // Determine plan tier from stored planTier field (set by webhook).
    // Fall back to "pro" for legacy active subscriptions without a planTier.
    const planTier = (userDoc.data.planTier as PlanTier) || (isActive ? "pro" : "none");
    const isAutopilot = isActive && planTier === "autopilot";
    const isPro = isActive && (planTier === "pro" || planTier === "autopilot");

    // Check if period has ended
    const periodEnd = userDoc.data.currentPeriodEnd as string | null;
    if (isPro && periodEnd && new Date(periodEnd) < new Date()) {
      return {
        plan: "none",
        isPro: false,
        isAutopilot: false,
        stripeCustomerId: userDoc.data.stripeCustomerId as string | null,
        stripeSubscriptionId: userDoc.data.stripeSubscriptionId as string | null,
        currentPeriodEnd: periodEnd,
        status: "expired",
      };
    }

    return {
      plan: isPro ? planTier : "none",
      isPro,
      isAutopilot,
      stripeCustomerId: (userDoc.data.stripeCustomerId as string) || null,
      stripeSubscriptionId: (userDoc.data.stripeSubscriptionId as string) || null,
      currentPeriodEnd: periodEnd || null,
      status,
    };
  } catch {
    return { plan: "none", isPro: false, isAutopilot: false, stripeCustomerId: null, stripeSubscriptionId: null, currentPeriodEnd: null, status: "error" };
  }
}
