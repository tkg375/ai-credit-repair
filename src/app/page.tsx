import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScoreChart } from "@/components/ScoreChart";

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
      <section className="bg-slate-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16">
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
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
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
