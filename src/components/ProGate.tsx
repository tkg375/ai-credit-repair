"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSubscription } from "@/lib/use-subscription";

const proFeatures = [
  "Unlimited dispute letters",
  "AI score simulator",
  "CFPB complaint generator",
  "Document vault",
  "Debt payoff optimizer",
  "Utilization tracker",
  "Bureau comparison",
  "Priority AI analysis",
  "Mail disputes via USPS",
];

export function ProGate({ children, feature }: { children: ReactNode; feature?: string }) {
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isPro) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md text-center">
        {/* Lock icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-lime-100 to-teal-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {feature ? `${feature} is a Pro Feature` : "Pro Feature"}
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Upgrade to Pro to unlock this and all other premium tools.
        </p>

        {/* Feature list */}
        <ul className="text-left space-y-2 mb-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          {proFeatures.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
              <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="mb-6">
          <span className="text-3xl font-bold text-slate-900">$19.99</span>
          <span className="text-slate-400 text-sm"> / month</span>
        </div>

        <Link
          href="/pricing"
          className="block w-full py-3 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 hover:from-lime-400 hover:via-teal-400 hover:to-cyan-500 text-white rounded-xl font-medium transition text-sm"
        >
          Upgrade to Pro
        </Link>
        <p className="text-xs text-slate-400 mt-3">Cancel anytime. No long-term commitment.</p>
      </div>
    </div>
  );
}
