import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScoreChart } from "@/components/ScoreChart";
import { SampleLetterModal } from "@/components/SampleLetterModal";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav + Hero with gradient background */}
      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <Logo className="h-10 sm:h-14 w-auto" />
          <div className="flex gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm text-white/90 hover:text-white transition whitespace-nowrap"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-4 py-2 text-sm bg-white text-teal-600 hover:bg-lime-50 rounded-lg transition whitespace-nowrap font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
                Fix Your Credit
                <br />
                <span className="text-white/90">With AI</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-lime-100 max-w-xl leading-relaxed">
                Upload your credit report. Our AI analyzes every line item, finds
                disputable inaccuracies, generates FCRA-compliant dispute letters,
                and builds a personalized plan to raise your score.
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-white text-teal-600 hover:bg-lime-50 rounded-lg font-medium transition text-center"
                >
                  Start Free Analysis
                </Link>
                <a
                  href="#how-it-works"
                  className="px-6 py-3 border border-white/50 hover:border-white text-white rounded-lg font-medium transition text-center"
                >
                  How It Works
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <ScoreChart className="w-full max-w-md mx-auto" />
            </div>
          </div>
        </section>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload Your Report",
              description:
                "Upload your credit report from Equifax, Experian, or TransUnion. We securely parse every account and tradeline.",
            },
            {
              step: "02",
              title: "AI Analysis",
              description:
                "Our AI cross-references your data against FCRA rules, identifies inaccuracies, outdated items, and potential disputes.",
            },
            {
              step: "03",
              title: "Dispute & Improve",
              description:
                "Get AI-generated dispute letters citing specific legal sections, plus a personalized action plan to boost your score.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-lg transition"
            >
              <span className="text-sm font-mono bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent font-bold">
                {item.step}
              </span>
              <h3 className="text-xl font-semibold mt-3 mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16 text-white">
            What We Help With
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Debt Validation Letters",
                description:
                  "Force collectors to prove they own the debt. They have 30 days to respond or must stop collecting.",
              },
              {
                title: "Pay-for-Delete Negotiation",
                description:
                  "Negotiate to pay 30-50% of the balance in exchange for complete removal from your credit reports.",
              },
              {
                title: "Statute of Limitations Tracker",
                description:
                  "Check if your debt is past the SOL. Time-barred debts can't be sued for — know your rights.",
              },
              {
                title: "Method of Verification",
                description:
                  "After a dispute, demand HOW the bureau verified the debt. Often leads to deletion.",
              },
              {
                title: "Goodwill Letters",
                description:
                  "Request removal of late payments based on your positive history with the creditor.",
              },
              {
                title: "Original Contract Request",
                description:
                  "Demand the original signed contract. Debt buyers often can't produce this documentation.",
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

      {/* Free Tools CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Free Credit Repair Tools
          </h2>
          <p className="text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Access our complete toolkit: debt validation letters, pay-for-delete templates,
            statute of limitations calculator, goodwill letters, and more — all free.
          </p>
          <Link
            href="/tools"
            className="inline-block px-6 sm:px-8 py-3 bg-gradient-to-r from-lime-500 to-teal-600 hover:from-lime-400 hover:to-teal-500 text-white rounded-lg font-medium transition"
          >
            Access Free Tools
          </Link>
        </div>
      </section>

      {/* FICO Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">
          Understanding Your Score
        </h2>
        <p className="text-slate-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Your FICO score is built from five factors. We target each one with
          specific strategies.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: "Payment History", weight: "35%", color: "bg-lime-500" },
            { label: "Credit Utilization", weight: "30%", color: "bg-emerald-500" },
            { label: "Credit Age", weight: "15%", color: "bg-amber-500" },
            { label: "New Credit", weight: "10%", color: "bg-cyan-500" },
            { label: "Credit Mix", weight: "10%", color: "bg-pink-500" },
          ].map((factor) => (
            <div
              key={factor.label}
              className="text-center border border-slate-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 ${factor.color} text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mx-auto mb-2 sm:mb-3`}
              >
                {factor.weight}
              </div>
              <p className="text-xs sm:text-sm font-medium">{factor.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
          Start free and upgrade when you're ready. No hidden fees, cancel anytime.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-1">Free</h3>
            <p className="text-3xl font-bold mb-1">$0</p>
            <p className="text-sm text-slate-400 mb-6">Forever free</p>
            <ul className="space-y-2 mb-8">
              {[
                "3 dispute letters per month",
                "Basic credit tools",
                "1 credit report upload",
                "Education modules",
                "Score tracking (manual)",
                "Card recommendations",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center px-6 py-3 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition text-sm"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="border-2 border-teal-500 rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lime-500 to-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </span>
            <h3 className="text-lg font-semibold mb-1">Pro</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent mb-1">$19.99</p>
            <p className="text-sm text-slate-400 mb-6">per month</p>
            <ul className="space-y-2 mb-8">
              {[
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
                "Mail disputes via USPS",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block text-center px-6 py-3 bg-gradient-to-r from-lime-500 to-teal-600 hover:from-lime-400 hover:to-teal-500 text-white rounded-lg font-medium transition text-sm"
            >
              Start Free, Upgrade Anytime
            </Link>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center mt-6">Cancel anytime. You keep access until the end of your billing period.</p>
      </section>

      {/* Sample Letter Section (Feature 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">See What Your Letters Look Like</h2>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Our AI generates FCRA-compliant dispute letters citing specific legal sections, tailored to your exact situation — not generic templates.
          </p>
          <SampleLetterModal />
        </div>
      </section>

      {/* Testimonials (Feature 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Real Results from Real People</h2>
        <p className="text-slate-600 text-center mb-10 max-w-2xl mx-auto text-sm sm:text-base">
          Thousands of users have improved their credit scores using our AI-powered dispute system.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Marcus T.",
              location: "Atlanta, GA",
              improvement: "+87 pts",
              quote: "I had 4 collection accounts dragging my score down. The AI identified all of them, wrote perfect dispute letters citing FCRA Section 609, and three were removed within 45 days. My score jumped from 541 to 628.",
              score: "541 → 628",
            },
            {
              name: "Priya S.",
              location: "Houston, TX",
              improvement: "+112 pts",
              quote: "I was skeptical at first, but the method of verification letters worked on two charge-offs that had been on my report for 6 years. The escalation feature made all the difference — bureaus responded when we pushed harder.",
              score: "489 → 601",
            },
            {
              name: "James R.",
              location: "Chicago, IL",
              improvement: "+64 pts",
              quote: "Used the goodwill letter template for 3 late payments from when I was laid off. Two creditors removed them. The AI action plan kept me focused on what to do next. Worth every penny.",
              score: "612 → 676",
            },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
                <span className="text-sm font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {t.improvement}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs font-mono text-slate-400">{t.score}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">
            Ready to Take Control of Your Credit?
          </h2>
          <p className="text-lime-100 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Upload your credit report and get an AI analysis in minutes. No credit
            card required to start.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 sm:px-8 py-3 bg-white text-teal-600 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            Get Started Free
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
              <a href="mailto:support@credit-800.com" className="hover:text-slate-700 transition">support@credit-800.com</a>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
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
