import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MarketingNav } from "@/components/MarketingNav";
import { AutopilotNotify } from "@/components/AutopilotNotify";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Simple, Transparent Plans",
  description: "Credit 800 starts at just $5/month. Get unlimited AI dispute letters, budget tracking, loan readiness, and more. No contracts, cancel anytime.",
};

const proFeatures = [
  "Unlimited dispute letters",
  "Budget tracker & spending charts",
  "Goals tracker with notifications",
  "Loan readiness calculator",
  "Letter templates library",
  "Credit freeze manager",
  "Debt payoff optimizer",
  "Credit score simulator",
  "Document vault (unlimited)",
  "CFPB complaint generator",
  "Analyze letters from collectors",
  "Mail disputes via USPS ($2/letter)",
];

const autopilotFeatures = [
  "Everything in Self Service",
  "Monthly soft-pull credit report",
  "Auto-generated dispute letters",
  "Automatic USPS mailing (up to 10/mo)",
  "VantageScore tracking — hands-free",
  "FCRA-compliant full automation",
  "Priority support",
  "Compliance audit trail",
];

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <MarketingNav />
      </header>
      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">Simple, Transparent Pricing</h1>
          <p className="text-lime-100 max-w-2xl mx-auto text-sm sm:text-base">
            Start from $5/month. No contracts, no hidden fees. Cancel anytime.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Self Service */}
          <div className="bg-white border-2 border-teal-500 rounded-2xl p-6 flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-1">Self Service</h3>
            <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">
              $5 <span className="text-sm font-normal text-slate-400">/ month</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">Full DIY credit repair toolkit</p>
            <ul className="space-y-2 flex-1 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center px-4 py-2.5 bg-gradient-to-r from-lime-500 to-teal-600 hover:from-lime-400 hover:to-teal-500 text-white rounded-xl font-medium transition text-sm">
              Get Started — $5/mo
            </Link>
          </div>

          {/* Autopilot */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-lime-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">NEW</div>
            <h3 className="font-semibold text-slate-900 mb-1">Autopilot</h3>
            <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              $49 <span className="text-sm font-normal text-slate-400">/ month</span>
            </p>
            <p className="text-xs text-slate-500 mb-5">We do everything for you</p>
            <ul className="space-y-2 flex-1 mb-6">
              {autopilotFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <AutopilotNotify />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Cancel anytime
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            No contracts
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Keep access until end of billing period
          </span>
        </div>

        <div className="max-w-2xl mx-auto mt-10 grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "FCRA Compliant",
              detail: "Fair Credit Reporting Act",
              desc: "Your right to dispute inaccurate information is protected under the FCRA. Bureaus must investigate within 30 days.",
            },
            {
              label: "FDCPA Protected",
              detail: "Fair Debt Collection Practices Act",
              desc: "The FDCPA protects you from abusive debt collectors. You have the right to request debt validation and stop contact.",
            },
            {
              label: "Secure & Private",
              detail: "256-bit encryption",
              desc: "Your documents and personal information are encrypted and never shared with third parties.",
            },
          ].map((t) => (
            <div key={t.label} className="border border-slate-200 rounded-xl p-4 text-center">
              <p className="font-semibold text-sm text-slate-800">{t.label}</p>
              <p className="text-xs text-teal-600 font-medium mt-0.5 mb-2">{t.detail}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">Have questions about which plan is right for you?</p>
          <Link href="/faq" className="text-teal-600 hover:text-teal-700 font-medium text-sm transition">
            Read our FAQ →
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <Logo className="h-6 w-auto" />
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-700 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-700 transition">Privacy</Link>
              <Link href="/support" className="hover:text-slate-700 transition">Support</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">&copy; {new Date().getFullYear()} Credit 800. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
