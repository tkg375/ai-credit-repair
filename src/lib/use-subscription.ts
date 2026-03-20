"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import type { PlanTier } from "./subscription";

interface SubscriptionState {
  plan: PlanTier;
  isPro: boolean;
  isAutopilot: boolean;
  loading: boolean;
  status: string;
}

// Module-level cache so every component shares one fetch per session
let cachedState: SubscriptionState | null = null;
let fetchPromise: Promise<void> | null = null;

export function useSubscription(): SubscriptionState {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<SubscriptionState>(
    cachedState ?? { plan: "pro", isPro: true, isAutopilot: false, loading: true, status: "active" }
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      cachedState = null;
      fetchPromise = null;
      setState({ plan: "none", isPro: false, isAutopilot: false, loading: false, status: "none" });
      return;
    }

    if (cachedState && !cachedState.loading) {
      setState(cachedState);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch("/api/stripe/subscription", {
        headers: { Authorization: `Bearer ${user.idToken}` },
      })
        .then((r) => r.json())
        .then((d) => {
          const plan = (d.plan as PlanTier) || "none";
          const isAutopilot = plan === "autopilot";
          // Self-service is free — all authenticated users have pro access
          const effectivePlan: PlanTier = plan === "none" ? "pro" : plan;
          cachedState = {
            plan: effectivePlan,
            isPro: true,
            isAutopilot,
            loading: false,
            status: d.status ?? "active",
          };
          setState(cachedState);
        })
        .catch(() => {
          // On error, still grant free self-service access
          cachedState = { plan: "pro", isPro: true, isAutopilot: false, loading: false, status: "active" };
          setState(cachedState);
        })
        .finally(() => {
          fetchPromise = null;
        });
    }

    fetchPromise.then(() => {
      if (cachedState) setState(cachedState);
    });
  }, [user, authLoading]);

  return state;
}

// Call this after a successful upgrade to clear the cache
export function invalidateSubscriptionCache() {
  cachedState = null;
  fetchPromise = null;
}
