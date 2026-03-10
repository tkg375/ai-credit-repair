import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sample Dispute Letters — FCRA-Compliant Templates",
  description: "See real examples of AI-generated FCRA dispute letters used to remove inaccurate collections, charge-offs, and late payments from credit reports.",
};

const BUREAU_LETTER = `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

Equifax Information Services LLC
P.O. Box 740256
Atlanta, GA 30374-0256

Re: FCRA Section 611 Dispute — Account #████-████-████-####

To Whom It May Concern:

Pursuant to my rights under the Fair Credit Reporting Act (FCRA), Section 611
(15 U.S.C. § 1681i), I am writing to dispute the following inaccurate information
appearing on my credit report:

DISPUTED ITEM:
  Creditor:                  ████████████ Inc.
  Account #:                 ████-████-████-####
  Balance Reported:          $█,███
  Status Reported:           Collection / Charge-Off
  Date of First Delinquency: ██/████

REASON FOR DISPUTE:
The above-referenced account contains inaccurate information. The balance and
account status reported do not reflect the true status of this account. I am
exercising my rights under FCRA § 611 to request a full investigation and
correction of this item.

FCRA § 611 REQUIRES YOU TO:
  1. Investigate the disputed information within 30 days
  2. Forward all relevant information to the furnisher of the information
  3. Delete or correct any information that cannot be verified
  4. Provide me with written notice of the results of your investigation

PLEASE PROVIDE:
  □ The name, address, and telephone number of the original creditor
  □ The method used to verify the disputed information
  □ Documentation used in the verification process
  □ A corrected copy of my credit report at no charge

This dispute is submitted in good faith. If this matter is not resolved within
the 30-day statutory period, I am prepared to file a complaint with the Consumer
Financial Protection Bureau (CFPB) and the Federal Trade Commission (FTC) and
seek all remedies available under FCRA § 616 and § 617.

Sincerely,

_________________________
[Your Name]
[Phone Number]
[Email Address]

Enclosures:
  - Copy of government-issued photo ID
  - Proof of current address (utility bill or bank statement)
  - Highlighted copy of credit report showing disputed item`;

const COLLECTOR_LETTER = `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

████████ Collections, LLC
[Collector Address]
[City, State ZIP]

Re: Debt Validation Demand — Account #████-████-████-####
    FDCPA § 809(b) — 15 U.S.C. § 1692g(b)

To Whom It May Concern:

I am writing in response to your recent collection attempt regarding the above-
referenced account. Pursuant to my rights under the Fair Debt Collection
Practices Act (FDCPA), Section 809(b) (15 U.S.C. § 1692g(b)), I hereby formally
dispute this debt and demand full validation.

DISPUTED DEBT DETAILS:
  Creditor Claiming Debt:    ████████ Collections, LLC
  Alleged Original Creditor: ████████████ Inc.
  Account #:                 ████-████-████-####
  Amount Claimed:            $█,███.██

UNDER THE FDCPA, YOU ARE REQUIRED TO PROVIDE:
  □ Verification of the original debt (amount and nature)
  □ Proof that your agency is licensed to collect in my state
  □ A copy of the original signed credit agreement
  □ A complete payment history showing how the amount was calculated
  □ The name and address of the original creditor
  □ Proof that the statute of limitations has not expired

NOTICE: You must cease all collection activity — including credit reporting —
until this validation is provided. Any continued collection attempts before
validation is received will constitute a violation of FDCPA § 809(b) and may
expose your company to civil liability under FDCPA § 813.

If you are unable to validate this debt, I demand that you:
  1. Cease all collection activity immediately
  2. Notify all credit reporting agencies to delete this account
  3. Confirm in writing that this matter is resolved

This is not a refusal to pay — it is a formal exercise of my rights under
federal law. Failure to comply will result in a complaint filed with the
Consumer Financial Protection Bureau (CFPB), the Federal Trade Commission
(FTC), and my state Attorney General's office.

Sincerely,

_________________________
[Your Name]
[Phone Number]
[Email Address]

Sent via: Certified Mail — Return Receipt Requested`;

const letterTypes = [
  {
    title: "FCRA § 611 Initial Dispute",
    desc: "Standard first-round bureau dispute. Demands investigation of inaccurate or unverifiable items.",
    tag: "Credit Bureau",
    tagColor: "bg-teal-100 text-teal-700",
  },
  {
    title: "Method of Verification (Round 2)",
    desc: "Escalation demanding the bureau explain exactly how they verified a disputed item.",
    tag: "Credit Bureau",
    tagColor: "bg-teal-100 text-teal-700",
  },
  {
    title: "Goodwill Letter",
    desc: "Asks a creditor to remove a negative item as goodwill — often works for isolated late payments.",
    tag: "Creditor Direct",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "Pay-for-Delete Letter",
    desc: "Offers full or partial payment to a collector in exchange for removing the account.",
    tag: "Debt Collector",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    title: "Debt Validation Letter",
    desc: "Demands the collector prove the debt is valid, accurate, and they have the right to collect.",
    tag: "Debt Collector",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    title: "Cease & Desist Letter",
    desc: "Legally orders a debt collector to stop all contact with you under the FDCPA.",
    tag: "Debt Collector",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    title: "CFPB Complaint Letter",
    desc: "Formal federal complaint — triggers a response directly from the creditor.",
    tag: "Regulatory",
    tagColor: "bg-rose-100 text-rose-700",
  },
];

export default function SampleLettersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <Link href="/">
            <Logo className="h-10 sm:h-14 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/90">
            <Link href="/faq" className="hover:text-white transition">FAQ</Link>
            <Link href="/plans" className="hover:text-white transition">Pricing</Link>
            <Link href="/sample-letters" className="text-white font-medium">Sample Letters</Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-14 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">Sample Dispute Letters</h1>
          <p className="text-lime-100 max-w-2xl mx-auto text-sm sm:text-base">
            AI-generated, FCRA & FDCPA-compliant letters citing specific legal sections — tailored to your situation, not generic templates.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {/* Letter types */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Every Letter Type, Included</h2>
          <p className="text-slate-500 text-sm mb-6">All letters are AI-generated and pre-filled with your specific account details from your credit report.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {letterTypes.map((l) => (
              <div key={l.title} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-slate-800">{l.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${l.tagColor}`}>{l.tag}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Personal details are redacted in these samples. Our AI fills them in automatically from your uploaded credit report.
        </div>

        {/* Letter 1 — Credit Bureau */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full">Credit Bureau</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">FCRA § 611 Initial Dispute Letter</h2>
              <p className="text-xs text-slate-500">Sent to Equifax, Experian, or TransUnion — first round</p>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-200 overflow-x-auto">
            {BUREAU_LETTER}
          </pre>
        </div>

        {/* Letter 2 — Debt Collector */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">Debt Collector</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">FDCPA § 809(b) Debt Validation Letter</h2>
              <p className="text-xs text-slate-500">Sent directly to the collection agency</p>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-200 overflow-x-auto">
            {COLLECTOR_LETTER}
          </pre>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Get Your Personalized Letters</h2>
          <p className="text-lime-100 text-sm mb-6 max-w-lg mx-auto">
            Your letters include specific account numbers, exact legal citations, and bureau/collector mailing addresses — AI-generated and ready to send.
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-teal-600 hover:bg-lime-50 rounded-lg font-medium transition">
            Get Started — $5/mo
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
