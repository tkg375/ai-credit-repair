import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScoreChart } from "@/components/ScoreChart";
import { MarketingNav } from "@/components/MarketingNav";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://credit-800.com/#organization",
      name: "Credit 800",
      url: "https://credit-800.com",
      logo: {
        "@type": "ImageObject",
        url: "https://credit-800.com/og-image.png",
      },
      sameAs: [
        "https://twitter.com/credit800",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://credit-800.com/#website",
      url: "https://credit-800.com",
      name: "Credit 800",
      description:
        "AI-powered credit repair: dispute letters, score analysis, and a personalized plan to reach 800.",
      publisher: { "@id": "https://credit-800.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://credit-800.com/faq?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://credit-800.com/#app",
      name: "Credit 800",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://credit-800.com",
      offers: {
        "@type": "Offer",
        price: "5.00",
        priceCurrency: "USD",
        billingIncrement: "P1M",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "312",
        bestRating: "5",
        worstRating: "1",
      },
      description:
        "Credit 800 uses AI to analyze your credit report, automatically generate FCRA-compliant dispute letters, and build a personalized action plan to reach an 800 credit score.",
    },
    {
      "@type": "HowTo",
      "@id": "https://credit-800.com/#howto",
      name: "How to Repair Your Credit with Credit 800",
      description:
        "Use AI to fix your credit, manage your finances, and get loan ready — all in one platform.",
      totalTime: "PT30M",
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: "5",
      },
      step: [
        {
          "@type": "HowToStep",
          name: "Fix Your Credit",
          text: "Upload your credit report. Our AI finds disputable inaccuracies, generates FCRA-compliant letters citing specific legal sections, and builds a personalized action plan to raise your score.",
          url: "https://credit-800.com/#how-it-works",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "Manage Your Finances",
          text: "Track your monthly budget, set financial goals, monitor your net worth, and plan your debt payoff — all from one dashboard.",
          url: "https://credit-800.com/#how-it-works",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "Get Loan Ready",
          text: "See exactly how ready you are for a mortgage, auto loan, or credit card. Know your DTI, what's holding you back, and what to fix first.",
          url: "https://credit-800.com/#how-it-works",
          position: 3,
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav + Hero with gradient background */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <MarketingNav />
      </header>

      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1 mb-4 sm:mb-6">
                <span className="w-2 h-2 bg-lime-300 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">All-in-One Financial Hub</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
                Your Credit &amp; Finances.
                <br />
                <span className="text-white/90">One Platform.</span>
                <br />
                <span className="text-white/90">Start from $5/month.</span>
              </h1>

              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-white text-teal-600 hover:bg-lime-50 rounded-lg font-medium transition text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/plans"
                  className="px-6 py-3 border border-white/50 hover:border-white text-white rounded-lg font-medium transition text-center"
                >
                  Our Plans
                </Link>
                <Link
                  href="/faq"
                  className="px-6 py-3 border border-white/50 hover:border-white text-white rounded-lg font-medium transition text-center"
                >
                  FAQs
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Credit Disputes", "Budget Tracker", "Loan Readiness", "Goals", "Debt Payoff", "Letter Templates"].map((t) => (
                  <span key={t} className="text-xs text-lime-200 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-lime-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <ScoreChart className="w-full max-w-md mx-auto" />
            </div>
          </div>
        </section>
      </div>

      {/* Features */}
      <section id="how-it-works" className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-white">
            A Full Financial Toolkit
          </h2>
          <p className="text-lime-100 text-center mb-4 max-w-2xl mx-auto text-sm sm:text-base">
            Every tool you need to improve your credit, manage your money, and build toward your goals.
          </p>
          <p className="text-lime-100 text-center mb-8 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base">
            From fixing your credit to tracking your budget to preparing for a loan — Credit 800 handles your full financial picture.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Credit Dispute Engine",
                description: "Upload your report and get FCRA-compliant dispute letters citing specific legal sections, tailored to each inaccuracy.",
              },
              {
                title: "Budget Tracker",
                description: "Log income and expenses by category, visualize monthly spending with charts, and stay on top of your finances.",
              },
              {
                title: "Loan Readiness Score",
                description: "See how ready you are for a mortgage, auto loan, or credit card based on your credit score and debt-to-income ratio.",
              },
              {
                title: "Goals Tracker",
                description: "Set credit score, savings, net worth, and debt payoff goals. Track progress with visual bars and get notified when you hit them.",
              },
              {
                title: "Letter Templates Library",
                description: "7 professional dispute and debt letter templates — goodwill, pay-for-delete, cease & desist, debt validation, and more.",
              },
              {
                title: "Credit Freeze Manager",
                description: "Track your freeze status across all 3 bureaus, store your PINs securely, and get direct links to freeze or unfreeze instantly.",
              },
              {
                title: "Debt Payoff Optimizer",
                description: "Choose avalanche or snowball method. See exact payoff timelines and interest savings for every account.",
              },
              {
                title: "Score Simulator",
                description: "Simulate what happens to your score when you pay off a card, open a new account, or resolve a collection.",
              },
              {
                title: "Smart Notifications",
                description: "Get alerted when your score changes, a goal is reached, or a dispute deadline is approaching.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-5 hover:bg-white/25 transition"
              >
                <h3 className="font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-lime-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
            Take Control of Your Entire Financial Life
          </h2>
          <p className="text-lime-100 mb-2 max-w-xl mx-auto text-sm sm:text-base">
            Credit repair, budgeting, goals, loan readiness — one platform, one login. Get started in minutes.
          </p>
          <p className="text-lime-100 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Debt validation letters, pay-for-delete templates, statute of limitations calculator, goodwill letters, and more — all included with your subscription.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 sm:px-8 py-3 bg-white text-teal-600 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <Logo className="h-6 w-auto" />
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-700 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-700 transition">Privacy</Link>
              <Link href="/support" className="hover:text-slate-700 transition">Support</Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            &copy; {new Date().getFullYear()} Credit 800. All rights reserved.
          </p>
          <p className="text-center text-xs text-slate-400 mt-1">
            Not a credit repair organization. Educational tool only.
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <a href="https://theweekendweb.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition no-underline">
              <span>Built by</span>
              <span className="font-mono text-sm"><span className="text-gray-600">&lt;</span><span className="text-violet-400">tww</span><span className="text-cyan-400">/</span><span className="text-gray-600">&gt;</span></span>
              <span className="text-gray-400">The Weekend Web</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
