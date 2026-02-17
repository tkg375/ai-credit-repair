"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

const freePlan = {
  name: "Free",
  price: "$0",
  period: "forever",
  features: [
    "3 dispute letters per month",
    "Basic credit tools",
    "1 credit report upload",
    "Education modules",
    "Score tracking (manual)",
    "Card recommendations",
  ],
  limitations: [
    "No escalation letters",
    "No CFPB complaint generator",
    "No document vault",
    "No debt payoff optimizer",
  ],
};

const proPlan = {
  name: "Pro",
  price: "$19.99",
  period: "per month",
  features: [
    "Unlimited dispute letters",
    "Round 2/3 escalation letters",
    "CFPB complaint generator",
    "Credit score simulator",
    "Document vault (unlimited storage)",
    "Debt payoff optimizer",
    "Smart notifications",
    "Priority AI analysis",
    "All credit tools",
    "Score tracking & charts",
    "Card recommendations",
    "Referral rewards",
  ],
  limitations: [],
};

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout. Please try again.");
      }
    } catch {
      alert("Failed to start checkout.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    setManaging(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Failed to open subscription management.");
    } finally {
      setManaging(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="pricing">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
          <p className="text-slate-500 text-lg">Unlock the full power of Credit 800</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-1">{freePlan.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">{freePlan.price}</span>
              <span className="text-slate-500 text-sm">/ {freePlan.period}</span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-3">Includes</p>
              <ul className="space-y-2">
                {freePlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {freePlan.limitations.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full mt-6 px-4 py-3 border border-slate-300 text-slate-600 rounded-xl font-medium cursor-default">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-lime-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1">{proPlan.name}</h2>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">{proPlan.price}</span>
              <span className="text-slate-500 text-sm">/ {proPlan.period}</span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-3">Everything in Free, plus</p>
              <ul className="space-y-2">
                {proPlan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {upgrading ? "Loading..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleManageSubscription}
            disabled={managing}
            className="text-sm text-slate-500 hover:text-teal-600 transition"
          >
            {managing ? "Loading..." : "Manage existing subscription"}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-8">
          <p className="text-xs text-slate-500 text-center">
            Cancel anytime. No long-term commitment. Your subscription will continue until the end of your billing period.
          </p>
        </div>
      </main>
    </AuthenticatedLayout>
  );
}
