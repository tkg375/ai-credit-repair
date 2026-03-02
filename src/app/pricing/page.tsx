"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

interface SubscriptionData {
  plan: "none" | "pro";
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  amount?: number;
  currency?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  lastInvoiceAmount?: number | null;
  lastInvoiceDate?: string | null;
}

const proFeatures = [
  "Unlimited dispute letters",
  "Round 2/3 escalation letters",
  "CFPB complaint generator",
  "Credit score simulator",
  "Document vault (unlimited)",
  "Debt payoff optimizer",
  "Priority AI analysis",
  "Score tracking & charts",
  "Smart notifications",
  "Card recommendations",
  "Referral rewards",
  "Mail disputes via USPS ($2/letter)",
];

function statusBadge(status: string, cancelAtPeriodEnd?: boolean) {
  if (cancelAtPeriodEnd) return { label: "Cancels at period end", color: "bg-amber-100 text-amber-700" };
  switch (status) {
    case "active": return { label: "Active", color: "bg-green-100 text-green-700" };
    case "trialing": return { label: "Trial", color: "bg-teal-100 text-teal-700" };
    case "past_due": return { label: "Past Due", color: "bg-red-100 text-red-700" };
    case "canceled": return { label: "Canceled", color: "bg-slate-100 text-slate-600" };
    default: return { label: "No Plan", color: "bg-slate-100 text-slate-600" };
  }
}

function cardBrandIcon(brand: string) {
  const brands: Record<string, string> = {
    visa: "💳 Visa",
    mastercard: "💳 Mastercard",
    amex: "💳 Amex",
    discover: "💳 Discover",
  };
  return brands[brand.toLowerCase()] ?? `💳 ${brand}`;
}

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/stripe/subscription", {
      headers: { Authorization: `Bearer ${user.idToken}` },
    })
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => setSub({ plan: "none", status: "none" }))
      .finally(() => setLoading(false));
  }, [user]);

  const openPortal = async () => {
    if (!user) return;
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.idToken}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Could not open billing portal. Please try again.");
    } catch {
      alert("Failed to open billing portal.");
    } finally {
      setOpeningPortal(false);
    }
  };

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
      if (data.url) window.location.href = data.url;
      else alert(`Checkout error: ${data.error || "Unknown error"}`);
    } catch {
      alert("Failed to start checkout.");
    } finally {
      setUpgrading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPro = sub?.plan === "pro";
  const isSubscribed = isPro;
  const badge = statusBadge(sub?.status ?? "none", sub?.cancelAtPeriodEnd);

  return (
    <AuthenticatedLayout activeNav="pricing">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent mb-1">
          Subscription
        </h1>
        <p className="text-slate-500 mb-8 text-sm">Manage your plan, billing, and payment method</p>

        {/* Current Plan Card */}
        <div className={`bg-white rounded-2xl border-2 p-6 mb-6 ${isSubscribed ? "border-teal-400" : "border-slate-200"}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{isSubscribed ? "Pro Plan" : "No Active Plan"}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                {isSubscribed
                  ? `$${((sub?.amount ?? 500) / 100).toFixed(2)} / month`
                  : "Subscribe to access all features"}
              </p>
            </div>
            {isSubscribed && (
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  {sub?.cancelAtPeriodEnd ? "Access until" : "Renews"}
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {sub?.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          {isSubscribed && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Payment Method</p>
              {sub?.paymentMethod ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {cardBrandIcon(sub.paymentMethod.brand)} •••• {sub.paymentMethod.last4}
                    </span>
                    <span className="text-xs text-slate-400">
                      Expires {sub.paymentMethod.expMonth}/{String(sub.paymentMethod.expYear).slice(-2)}
                    </span>
                  </div>
                  <button
                    onClick={openPortal}
                    disabled={openingPortal}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium transition"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">No payment method on file</span>
                  <button
                    onClick={openPortal}
                    disabled={openingPortal}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium transition"
                  >
                    Add Card
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Last Invoice */}
          {isSubscribed && sub?.lastInvoiceAmount != null && (
            <div className="text-xs text-slate-400 mb-4">
              Last payment: ${(sub.lastInvoiceAmount / 100).toFixed(2)} on{" "}
              {sub.lastInvoiceDate
                ? new Date(sub.lastInvoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isSubscribed ? (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="px-6 py-2.5 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 text-sm"
              >
                {upgrading ? "Loading..." : "Subscribe — $5/mo"}
              </button>
            ) : (
              <>
                <button
                  onClick={openPortal}
                  disabled={openingPortal}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50 text-sm"
                >
                  {openingPortal ? "Loading..." : "Update Payment Method"}
                </button>
                {!sub?.cancelAtPeriodEnd && (
                  <button
                    onClick={openPortal}
                    disabled={openingPortal}
                    className="px-5 py-2.5 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition disabled:opacity-50 text-sm"
                  >
                    Cancel Subscription
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Plan Details */}
        <div className="max-w-md mx-auto">
          <div className={`bg-white rounded-2xl border p-5 ${isSubscribed ? "border-teal-400 ring-1 ring-teal-400" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Pro Plan — Everything Included</h3>
              {isSubscribed && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Current</span>}
            </div>
            <p className="text-2xl font-bold mb-4 bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">
              $5 <span className="text-sm font-normal text-slate-400">/ mo</span>
            </p>
            <ul className="space-y-1.5">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {!isSubscribed && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 text-sm"
              >
                {upgrading ? "Loading..." : "Subscribe Now"}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Cancel anytime. You keep access until the end of your billing period.
        </p>
      </main>
    </AuthenticatedLayout>
  );
}
