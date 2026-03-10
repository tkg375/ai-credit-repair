import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Get answers to common questions about Credit 800, FCRA dispute letters, credit repair, and how our AI-powered platform works.",
};

const faqs = [
  {
    q: "Why do we charge?",
    a: "We wish we could offer Credit 800 completely free — and honestly, we'd love to. But the AI that powers your dispute letter generation, credit analysis, and smart recommendations isn't free for us to run. Every letter generated, every report analyzed, and every recommendation made costs us in AI processing fees. On top of that, there's hosting, infrastructure, security, and ongoing development to keep everything fast, private, and up to date. At $5/month, we're covering those real costs while keeping the price as low as humanly possible. We believe everyone deserves access to these tools — not just people who can afford $100/month credit repair companies — so we've worked hard to make it as affordable as we can.",
  },
  {
    q: "Is this legit? I've been burned by credit repair scams before.",
    a: "We understand the skepticism — the credit repair industry is full of companies that charge hundreds of dollars and deliver nothing. Credit 800 is different: it's a self-service tool that puts you in control. We don't make promises on your behalf or charge per letter. You generate your own FCRA-compliant dispute letters using AI, send them yourself, and keep 100% of the results. No shady contracts, no recurring upsells.",
  },
  {
    q: "What is the FCRA and how does it protect me?",
    a: "The Fair Credit Reporting Act (FCRA) is a federal law that gives you the right to dispute any inaccurate, incomplete, or unverifiable information on your credit report. Credit bureaus are required by law to investigate your disputes within 30 days and remove anything they cannot verify. Credit 800 generates dispute letters that cite specific FCRA sections so your disputes carry legal weight.",
  },
  {
    q: "What is the FDCPA and what rights do I have with debt collectors?",
    a: "The Fair Debt Collection Practices Act (FDCPA) protects you from abusive, deceptive, or unfair debt collection practices. Under the FDCPA, you have the right to request debt validation (proof the debt is yours and the amount is correct), dispute the debt in writing, and demand collectors stop contacting you. Our letter templates include FDCPA-compliant cease & desist and debt validation letters.",
  },
  {
    q: "How fast will I see results?",
    a: "Credit bureaus are required to respond to disputes within 30 days (sometimes 45 days if you submit additional documentation). Many users see their first removals within 30–60 days. Results depend on your specific situation — inaccurate items, outdated accounts, and unverifiable collections are typically the fastest to remove. Payment history and utilization improvements can reflect on your report within 1–2 billing cycles.",
  },
  {
    q: "Do I need to send letters myself?",
    a: "For digital disputes, you copy the letter and submit it directly on the bureau's website (Equifax, Experian, TransUnion) or via certified mail. We also offer a USPS mail service ($2/letter) where we print and mail the dispute on your behalf with a trackable delivery confirmation.",
  },
  {
    q: "What if the bureau doesn't respond or denies my dispute?",
    a: "If a bureau denies your dispute, you can escalate with a Method of Verification letter demanding they explain exactly how they verified the item — this forces a more thorough reinvestigation. If they still fail to respond within 30 days, the item must be removed by law. Credit 800 includes escalation letter templates for exactly these situations.",
  },
  {
    q: "Does disputing items hurt my credit score?",
    a: "No. Filing a dispute does not trigger a hard inquiry and will not lower your score. In fact, successfully removing negative items almost always results in a score increase. The only way disputing can backfire is if you dispute accurate, positive information — so stick to disputing inaccuracies and unverifiable items.",
  },
  {
    q: "What's included in the $5/month subscription?",
    a: "Everything — unlimited dispute letters, budget tracker, debt payoff optimizer, credit score simulator, loan readiness calculator, goals tracker, document vault, CFPB complaint generator, letter templates library (goodwill, pay-for-delete, cease & desist, debt validation, and more), creditor letter analyzer, and smart notifications. No feature gates, no usage limits.",
  },
  {
    q: "How is Credit 800 different from hiring a credit repair company?",
    a: "Traditional credit repair companies charge $79–$149/month and do the same thing you can do yourself for free (disputing items under the FCRA). Many also require long-term contracts. Credit 800 gives you the same AI-powered tools for $5/month and puts you in the driver's seat — you see exactly what's being sent and why, and you keep 100% of the results.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. There are no contracts, no cancellation fees, and no questions asked. You can cancel from your account settings at any time. You'll keep full access to all features until the end of your current billing period.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. All data is encrypted in transit and at rest using 256-bit encryption. We never sell your data or share it with third parties. Your uploaded documents are stored securely and only accessible by you.",
  },
  {
    q: "Do I need my SSN to use Credit 800?",
    a: "No. You do not need to provide your Social Security Number to use Credit 800. You upload your credit report (which you can get for free at AnnualCreditReport.com) and our AI analyzes it. Your SSN is never required or stored.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <Link href="/">
            <Logo className="h-10 sm:h-14 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/90">
            <Link href="/plans" className="hover:text-white transition">Pricing</Link>
            <Link href="/sample-letters" className="hover:text-white transition">Sample Letters</Link>
            <Link href="/faq" className="text-white font-medium">FAQ</Link>
            <Link href="/support" className="hover:text-white transition">Support</Link>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm text-white/90 hover:text-white transition whitespace-nowrap">
              Log In
            </Link>
            <Link href="/register" className="px-3 sm:px-4 py-2 text-sm bg-white text-teal-600 hover:bg-lime-50 rounded-lg transition whitespace-nowrap font-medium">
              Get Started
            </Link>
          </div>
        </nav>
      </header>
      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-lime-100 max-w-2xl mx-auto text-sm sm:text-base">
            Everything you need to know before getting started with Credit 800.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-medium text-sm text-slate-800 hover:bg-slate-50 transition list-none">
                {item.q}
                <svg className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Still have questions?</h2>
          <p className="text-slate-300 text-sm mb-5">Our support team is happy to help.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/support" className="px-6 py-2.5 border border-white/30 text-white hover:border-white rounded-lg font-medium transition text-sm">
              Contact Support
            </Link>
            <Link href="/register" className="px-6 py-2.5 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-lg font-medium hover:opacity-90 transition text-sm">
              Get Started — $5/mo
            </Link>
          </div>
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
