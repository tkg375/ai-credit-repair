"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSubscription, invalidateSubscriptionCache } from "@/lib/use-subscription";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

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

const autopilotFeatures = [
  "Everything in Pro",
  "Monthly soft-pull credit report",
  "Auto-generated dispute letters",
  "Automatic USPS mailing (up to 10/mo)",
  "VantageScore tracking — hands-free",
  "FCRA-compliant full automation",
  "Priority support",
  "Compliance audit trail",
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
  const brands: Record<string, string> = { visa: "💳 Visa", mastercard: "💳 Mastercard", amex: "💳 Amex", discover: "💳 Discover" };
  return brands[brand.toLowerCase()] ?? `💳 ${brand}`;
}

interface SubscriptionData {
  plan: "none" | "pro" | "autopilot";
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  amount?: number;
  currency?: string;
  paymentMethod?: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  lastInvoiceAmount?: number | null;
  lastInvoiceDate?: string | null;
}

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const { plan } = useSubscription();
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPro, setUpgradingPro] = useState(false);
  const [upgradingAutopilot, setUpgradingAutopilot] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "loading" | "done" | "duplicate">("idle");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/stripe/subscription", { headers: { Authorization: `Bearer ${user.idToken}` } })
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => setSub({ plan: "none", status: "none" }))
      .finally(() => setLoading(false));
  }, [user]);

  const openPortal = async () => {
    if (!user) return;
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST", headers: { Authorization: `Bearer ${user.idToken}` } });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Could not open billing portal.");
    } catch { alert("Failed to open billing portal."); }
    finally { setOpeningPortal(false); }
  };

  const handleNotify = async () => {
    if (!notifyEmail.includes("@")) return;
    setNotifyState("loading");
    try {
      const res = await fetch("/api/autopilot/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail }),
      });
      const data = await res.json();
      setNotifyState(data.duplicate ? "duplicate" : "done");
    } catch {
      setNotifyState("idle");
    }
  };

  const handleUpgrade = async (tier: "pro" | "autopilot") => {
    if (!user) return;
    if (tier === "pro") setUpgradingPro(true);
    else setUpgradingAutopilot(true);

    try {
      const endpoint = tier === "autopilot" ? "/api/stripe/checkout/autopilot" : "/api/stripe/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.idToken}` },
      });
      const data = await res.json();
      if (data.url) {
        invalidateSubscriptionCache();
        window.location.href = data.url;
      } else alert(`Checkout error: ${data.error || "Unknown error"}`);
    } catch { alert("Failed to start checkout."); }
    finally { setUpgradingPro(false); setUpgradingAutopilot(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPro = plan === "pro";
  const isAutopilot = plan === "autopilot";
  const isSubscribed = isPro || isAutopilot;
  const badge = statusBadge(sub?.status ?? "none", sub?.cancelAtPeriodEnd);

  return (
    <AuthenticatedLayout activeNav="pricing">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent mb-1">
          Subscription
        </h1>
        <p className="text-slate-500 mb-8 text-sm">Manage your plan, billing, and payment method</p>

        {/* Past-due payment banner */}
        {sub?.status === "past_due" && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-red-700 mb-1">Your payment failed — access is paused</p>
              <p className="text-sm text-red-600">Update your payment method to restore full access immediately. Your data and disputes are safe.</p>
            </div>
            <button
              onClick={openPortal}
              disabled={openingPortal}
              className="shrink-0 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 text-sm"
            >
              {openingPortal ? "Loading..." : "Update Payment Method"}
            </button>
          </div>
        )}

        {/* Current plan card */}
        {isSubscribed && (
          <div className={`bg-white rounded-2xl border-2 p-6 mb-8 ${isAutopilot ? "border-cyan-400" : "border-teal-400"}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">
                    {isAutopilot ? "Credit 800 Autopilot" : "Credit 800 Self Service"}
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                </div>
                <p className="text-slate-500 text-sm">
                  ${((sub?.amount ?? 500) / 100).toFixed(2)} / month
                </p>
              </div>
              {sub?.currentPeriodEnd && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">{sub.cancelAtPeriodEnd ? "Access until" : "Renews"}</p>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {sub?.paymentMethod && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Payment Method</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{cardBrandIcon(sub.paymentMethod.brand)} •••• {sub.paymentMethod.last4}</span>
                    <span className="text-xs text-slate-400">Expires {sub.paymentMethod.expMonth}/{String(sub.paymentMethod.expYear).slice(-2)}</span>
                  </div>
                  <button onClick={openPortal} disabled={openingPortal} className="text-xs text-teal-600 hover:text-teal-700 font-medium transition">Update</button>
                </div>
              </div>
            )}

            {sub?.lastInvoiceAmount != null && (
              <div className="text-xs text-slate-400 mb-4">
                Last payment: ${(sub.lastInvoiceAmount / 100).toFixed(2)} on{" "}
                {sub.lastInvoiceDate ? new Date(sub.lastInvoiceDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button onClick={openPortal} disabled={openingPortal} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50 text-sm">
                {openingPortal ? "Loading..." : "Manage Billing"}
              </button>
              {isAutopilot && (
                <a href="/autopilot" className="px-5 py-2.5 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition text-sm">
                  Go to Autopilot Dashboard
                </a>
              )}
              {!sub?.cancelAtPeriodEnd && (
                <button onClick={openPortal} disabled={openingPortal} className="px-5 py-2.5 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition disabled:opacity-50 text-sm">
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing tiers */}
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Self Service */}
          <div className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${isPro ? "border-teal-400 ring-1 ring-teal-400" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900">Self Service</h3>
              {isPro && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Your Plan</span>}
            </div>
            <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">$5 <span className="text-sm font-normal text-slate-400">/ month</span></p>
            <p className="text-xs text-slate-500 mb-5">DIY credit repair toolkit</p>
            <ul className="space-y-2 flex-1 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            {!isSubscribed ? (
              <button onClick={() => handleUpgrade("pro")} disabled={upgradingPro} className="w-full py-2.5 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 text-sm">
                {upgradingPro ? "Loading..." : "Subscribe — Self Service $5/mo"}
              </button>
            ) : isPro ? (
              <div className="text-center text-sm text-teal-600 font-medium py-2">Active</div>
            ) : (
              <div className="text-center text-sm text-slate-400 py-2">Included in Autopilot</div>
            )}
          </div>

          {/* Autopilot */}
          <div className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative overflow-hidden ${isAutopilot ? "border-cyan-400 ring-1 ring-cyan-400" : "border-slate-200"}`}>
            <div className="absolute top-0 right-0 bg-gradient-to-r from-lime-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              Coming Soon
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-slate-900">Autopilot</h3>
              {isAutopilot && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">Your Plan</span>}
            </div>
            <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              $49 <span className="text-sm font-normal text-slate-400">/ month</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">Fully automated — we do everything</p>
            <ul className="space-y-2 flex-1 mb-6">
              {autopilotFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            {isAutopilot ? (
              <div className="text-center text-sm text-cyan-600 font-medium py-2">Active</div>
            ) : notifyState === "done" ? (
              <div className="text-center text-sm text-teal-600 font-medium py-2">✓ We'll notify you when it's live!</div>
            ) : notifyState === "duplicate" ? (
              <div className="text-center text-sm text-slate-500 py-2">You're already on the list!</div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 text-center">Get notified when Autopilot launches</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNotify()}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    onClick={handleNotify}
                    disabled={notifyState === "loading" || !notifyEmail.includes("@")}
                    className="px-3 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shrink-0"
                  >
                    {notifyState === "loading" ? "..." : "Notify Me"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Cancel anytime. You keep access until the end of your billing period. Autopilot mailing fee included for up to 10 letters/month.
        </p>
      </main>
    </AuthenticatedLayout>
  );
}
