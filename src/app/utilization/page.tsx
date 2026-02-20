"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { ProGate } from "@/components/ProGate";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface Card {
  id: string;
  creditorName: string;
  balance: number;
  creditLimit: number;
  utilization: number;
}

export default function UtilizationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetPct, setTargetPct] = useState(10);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`${FIRESTORE_BASE}:runQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.idToken}` },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "reportItems" }],
          where: { fieldFilter: { field: { fieldPath: "userId" }, op: "EQUAL", value: { stringValue: user.uid } } },
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        const items = (data as Record<string, unknown>[])
          .filter(r => (r as Record<string, unknown>).document)
          .map(r => {
            const doc = (r as Record<string, unknown>).document as Record<string, unknown>;
            const fields = doc.fields as Record<string, Record<string, unknown>>;
            const str = (f: string) => (fields?.[f]?.stringValue as string) || "";
            const num = (f: string) => Number(fields?.[f]?.integerValue || fields?.[f]?.doubleValue || 0);
            const docName = doc.name as string;
            const id = docName.split("/").pop()!;
            const accountType = str("accountType").toLowerCase();
            const creditLimit = num("creditLimit");
            // Only include revolving credit (credit cards) with a known limit
            if (
              (accountType.includes("credit card") || accountType.includes("revolving")) &&
              creditLimit > 0
            ) {
              const balance = num("balance");
              return {
                id,
                creditorName: str("creditorName"),
                balance,
                creditLimit,
                utilization: creditLimit > 0 ? Math.round((balance / creditLimit) * 100) : 0,
              } as Card;
            }
            return null;
          })
          .filter(Boolean) as Card[];
        setCards(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.creditLimit, 0);
  const overallUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

  const targetBalance = Math.floor(totalLimit * (targetPct / 100));
  const paydownNeeded = Math.max(0, totalBalance - targetBalance);

  const getUtilColor = (pct: number) => {
    if (pct <= 10) return "bg-green-500";
    if (pct <= 30) return "bg-amber-500";
    return "bg-red-500";
  };

  const getUtilText = (pct: number) => {
    if (pct <= 10) return "text-green-600";
    if (pct <= 30) return "text-amber-600";
    return "text-red-600";
  };

  const scoreImpact = (current: number, target: number) => {
    const diff = current - target;
    if (diff <= 0) return "+0";
    if (diff <= 10) return "+5–15";
    if (diff <= 20) return "+15–30";
    if (diff <= 40) return "+30–60";
    return "+50–100";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="utilization">
      <ProGate feature="Utilization Optimizer">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
          Credit Utilization Optimizer
        </h1>
        <p className="text-slate-500 mb-8">
          Keeping utilization under 10% is one of the fastest ways to boost your score. Under 30% is the minimum goal.
        </p>

        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Credit Card Data</h3>
            <p className="text-slate-500">Upload a credit report to see your utilization analysis.</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Overall Utilization</p>
                <p className={`text-3xl font-bold ${getUtilText(overallUtilization)}`}>{overallUtilization}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total Balance</p>
                <p className="text-3xl font-bold text-slate-900">${totalBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total Limit</p>
                <p className="text-3xl font-bold text-slate-900">${totalLimit.toLocaleString()}</p>
              </div>
            </div>

            {/* Target Utilization Slider */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Target Utilization</h2>
                <span className="text-teal-600 font-bold text-lg">{targetPct}%</span>
              </div>
              <input
                type="range" min={5} max={30} step={5} value={targetPct}
                onChange={e => setTargetPct(Number(e.target.value))}
                className="w-full accent-teal-600 mb-4"
              />
              <div className="flex justify-between text-xs text-slate-500 mb-4">
                <span>5% (Elite)</span><span>10% (Excellent)</span><span>20% (Good)</span><span>30% (Minimum)</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 p-4 bg-teal-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500">Pay Down</p>
                  <p className="text-xl font-bold text-teal-700">${paydownNeeded.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Target Balance</p>
                  <p className="text-xl font-bold text-slate-900">${targetBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Est. Score Impact</p>
                  <p className="text-xl font-bold text-green-600">{scoreImpact(overallUtilization, targetPct)} pts</p>
                </div>
              </div>
            </div>

            {/* Per-Card Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold">Card-by-Card Breakdown</h2>
                <p className="text-xs text-slate-500 mt-0.5">Prioritize paying down cards over 30% first</p>
              </div>
              <div className="divide-y divide-slate-100">
                {cards
                  .sort((a, b) => b.utilization - a.utilization)
                  .map(card => {
                    const cardTarget = Math.floor(card.creditLimit * (targetPct / 100));
                    const cardPaydown = Math.max(0, card.balance - cardTarget);
                    return (
                      <div key={card.id} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{card.creditorName}</p>
                            <p className="text-xs text-slate-500">${card.balance.toLocaleString()} / ${card.creditLimit.toLocaleString()} limit</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getUtilText(card.utilization)}`}>{card.utilization}%</p>
                            {cardPaydown > 0 && (
                              <p className="text-xs text-teal-600 font-medium">Pay ${cardPaydown.toLocaleString()} → {targetPct}%</p>
                            )}
                            {cardPaydown === 0 && <p className="text-xs text-green-600 font-medium">✓ At target</p>}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getUtilColor(card.utilization)}`}
                            style={{ width: `${Math.min(100, card.utilization)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
              <h2 className="font-semibold mb-3">Quick Wins to Lower Utilization</h2>
              <ul className="space-y-2 text-sm text-white/90">
                <li className="flex gap-2"><span>→</span> Ask for a credit limit increase (same card, lower utilization instantly)</li>
                <li className="flex gap-2"><span>→</span> Pay your balance before the statement closing date (not just the due date)</li>
                <li className="flex gap-2"><span>→</span> Open a new card to increase total available credit (hard inquiry — only if score is stable)</li>
                <li className="flex gap-2"><span>→</span> Spread balances across cards rather than maxing one out</li>
              </ul>
            </div>
          </>
        )}
      </main>
      </ProGate>
    </AuthenticatedLayout>
  );
}
