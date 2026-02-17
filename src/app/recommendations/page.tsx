"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { getRecommendations, type CreditCard } from "@/lib/card-recommendations";

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [score, setScore] = useState(600);
  const [goals, setGoals] = useState<string[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [sortBy, setSortBy] = useState("best_match");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const recs = getRecommendations(score, goals);
    let sorted = [...recs];
    if (sortBy === "lowest_fee") sorted.sort((a, b) => a.annualFee - b.annualFee);
    if (sortBy === "no_deposit") sorted.sort((a, b) => {
      if (a.deposit === null && b.deposit !== null) return -1;
      if (a.deposit !== null && b.deposit === null) return 1;
      return 0;
    });
    setCards(sorted);
  }, [score, goals, sortBy]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="recommendations">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
          Credit Builder Card Picks
        </h1>
        <p className="text-slate-500 mb-8">Find the best card to help you build or rebuild credit.</p>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Credit Score</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={300}
                max={850}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="flex-1 accent-teal-600"
              />
              <span className="text-lg font-bold text-teal-600 w-12 text-center">{score}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Goals</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "build_credit", label: "Build Credit" },
                { key: "rewards", label: "Earn Rewards" },
                { key: "no_fees", label: "Low/No Fees" },
                { key: "no_deposit", label: "No Deposit" },
                { key: "all_bureaus", label: "Reports to All 3 Bureaus" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleGoal(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    goals.includes(key) ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="best_match">Best Match</option>
              <option value="lowest_fee">Lowest Fee</option>
              <option value="no_deposit">No Deposit First</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="space-y-4 mb-8">
          {cards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">No cards match your criteria. Try adjusting your score or goals.</p>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Card Visual */}
                  <div className={`w-full sm:w-48 h-28 sm:h-auto bg-gradient-to-br ${card.colorClass} p-4 flex flex-col justify-between`}>
                    <p className="text-white/80 text-xs font-medium">{card.issuer}</p>
                    <p className="text-white font-bold text-sm">{card.name}</p>
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{card.name}</h3>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{card.bestFor}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        card.type === "secured" ? "bg-blue-100 text-blue-700" :
                        card.type === "credit_builder" ? "bg-purple-100 text-purple-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {card.type === "credit_builder" ? "Credit Builder" : card.type === "secured" ? "Secured" : "Unsecured"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Annual Fee</p>
                        <p className="font-medium">{card.annualFee === 0 ? "$0" : `$${card.annualFee}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Deposit</p>
                        <p className="font-medium">{card.deposit === null ? "None" : `$${card.deposit}`}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">APR</p>
                        <p className="font-medium text-xs">{card.aprRange}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Reports To</p>
                        <p className="font-medium text-xs">{card.reportsToBureaus.length === 3 ? "All 3 Bureaus" : card.reportsToBureaus.join(", ")}</p>
                      </div>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-1">
                      {card.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-teal-500 mt-0.5">+</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">
            <strong>Disclaimer:</strong> Credit 800 is not a financial advisor. Card information is provided for
            educational purposes and may not reflect current terms. Always review the issuer&apos;s website for the most
            up-to-date details. We may receive compensation if you apply through affiliate links.
          </p>
        </div>
      </main>
    </AuthenticatedLayout>
  );
}
