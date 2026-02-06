import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScoreChart } from "@/components/ScoreChart";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Logo className="h-14 w-auto" />
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Fix Your Credit
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">With AI</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 max-w-xl leading-relaxed">
              Upload your credit report. Our AI analyzes every line item, finds
              disputable inaccuracies, generates FCRA-compliant dispute letters,
              and builds a personalized plan to raise your score.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition"
              >
                Start Free Analysis
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3 border border-slate-300 hover:border-slate-400 rounded-lg font-medium transition"
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

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
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
              <span className="text-sm font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
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
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
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
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Free Credit Repair Tools
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Access our complete toolkit: debt validation letters, pay-for-delete templates,
            statute of limitations calculator, goodwill letters, and more — all free.
          </p>
          <Link
            href="/tools"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-lg font-medium transition"
          >
            Access Free Tools
          </Link>
        </div>
      </section>

      {/* FICO Breakdown */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Understanding Your Score
        </h2>
        <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
          Your FICO score is built from five factors. We target each one with
          specific strategies.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Payment History", weight: "35%", color: "bg-blue-500" },
            { label: "Credit Utilization", weight: "30%", color: "bg-emerald-500" },
            { label: "Credit Age", weight: "15%", color: "bg-amber-500" },
            { label: "New Credit", weight: "10%", color: "bg-purple-500" },
            { label: "Credit Mix", weight: "10%", color: "bg-pink-500" },
          ].map((factor) => (
            <div
              key={factor.label}
              className="text-center border border-slate-200 rounded-xl p-4 hover:shadow-lg transition"
            >
              <div
                className={`w-12 h-12 ${factor.color} text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3`}
              >
                {factor.weight}
              </div>
              <p className="text-sm font-medium">{factor.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Take Control of Your Credit?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Upload your credit report and get an AI analysis in minutes. No credit
            card required to start.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 hover:bg-slate-100 rounded-lg font-medium transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center text-sm text-slate-500">
          <Logo className="h-6 w-auto" />
          <span>Not a credit repair organization. Educational tool only.</span>
        </div>
      </footer>
    </div>
  );
}
