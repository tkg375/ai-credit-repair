"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface ActionStep {
  order: number;
  title: string;
  description: string;
  category: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  timeframe: string;
  completed: boolean;
}

interface ActionPlan {
  id: string;
  title: string;
  summary: string;
  steps: ActionStep[];
  createdAt: Date;
}

function firestoreValueToJs(val: Record<string, unknown>): unknown {
  if ("stringValue" in val) return val.stringValue;
  if ("integerValue" in val) return parseInt(val.integerValue as string, 10);
  if ("doubleValue" in val) return val.doubleValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("nullValue" in val) return null;
  if ("timestampValue" in val) return new Date(val.timestampValue as string);
  if ("arrayValue" in val) {
    const arr = val.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in val) {
    const map = val.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields || {})) {
      result[k] = firestoreValueToJs(v);
    }
    return result;
  }
  return null;
}

function parseDocument(doc: { name: string; fields?: Record<string, Record<string, unknown>> }): Record<string, unknown> & { id: string } {
  const id = doc.name.split("/").pop()!;
  const result: Record<string, unknown> = { id };
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) {
      result[k] = firestoreValueToJs(v);
    }
  }
  return result as Record<string, unknown> & { id: string };
}

async function queryCollection(
  idToken: string,
  collection: string,
  userId: string,
  orderByField?: string,
  limitCount?: number
) {
  const query: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: "userId" },
          op: "EQUAL",
          value: { stringValue: userId },
        },
      },
      ...(orderByField ? { orderBy: [{ field: { fieldPath: orderByField }, direction: "DESCENDING" }] } : {}),
      ...(limitCount ? { limit: limitCount } : {}),
    },
  };

  const res = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data
    .filter((item: { document?: unknown }) => item.document)
    .map((item: { document: { name: string; fields?: Record<string, Record<string, unknown>> } }) => parseDocument(item.document));
}

export default function PlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadPlan() {
      try {
        const plans = await queryCollection(user!.idToken, "actionPlans", user!.uid, "createdAt", 1);
        if (plans.length > 0) {
          const planData = plans[0];
          const steps = (planData.steps as ActionStep[]) || [];
          setPlan({
            id: planData.id,
            title: planData.title as string || "Your Credit Improvement Plan",
            summary: planData.summary as string || "",
            steps: steps,
            createdAt: planData.createdAt as Date,
          });
          // Load completed steps from localStorage
          const saved = localStorage.getItem(`plan_${planData.id}_completed`);
          if (saved) {
            setCompletedSteps(new Set(JSON.parse(saved)));
          }
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [user, authLoading, router]);

  const toggleStepComplete = (stepOrder: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepOrder)) {
        newSet.delete(stepOrder);
      } else {
        newSet.add(stepOrder);
      }
      // Save to localStorage
      if (plan) {
        localStorage.setItem(`plan_${plan.id}_completed`, JSON.stringify([...newSet]));
      }
      return newSet;
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return "from-red-500 to-pink-600";
      case "MEDIUM":
        return "from-amber-500 to-orange-600";
      case "LOW":
        return "from-slate-400 to-slate-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700";
      case "LOW":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "DISPUTE":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "PAYMENT":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "UTILIZATION":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "CREDIT_MIX":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const completedCount = completedSteps.size;
  const totalSteps = plan?.steps.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-900">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-200">
        <Link href="/">
          <Logo className="h-8 w-auto" />
        </Link>
        <div className="flex gap-4 text-sm items-center">
          <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition">
            Dashboard
          </Link>
          <Link href="/upload" className="text-slate-600 hover:text-blue-600 transition">
            Upload Report
          </Link>
          <Link href="/tools" className="text-slate-600 hover:text-blue-600 transition">
            Credit Tools
          </Link>
          <Link href="/disputes" className="text-slate-600 hover:text-blue-600 transition">
            Disputes
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Action Plan</h1>
        <p className="text-slate-600 mb-8">
          Follow these steps to improve your credit score. Items are ordered by impact.
        </p>

        {!plan ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-3">No Action Plan Yet</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Upload your credit report and we&apos;ll generate a personalized action plan to help you reach an 800 credit score.
            </p>
            <Link
              href="/upload"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition"
            >
              Upload Credit Report
            </Link>
          </div>
        ) : (
          <>
            {/* Progress Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg">{plan.title}</h2>
                  <p className="text-sm text-slate-500">{completedCount} of {totalSteps} steps completed</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {plan.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <p className="text-blue-800 text-sm">{plan.summary}</p>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-4">
              {plan.steps.map((step) => {
                const isCompleted = completedSteps.has(step.order);
                return (
                  <div
                    key={step.order}
                    className={`bg-white border rounded-xl p-6 transition ${
                      isCompleted
                        ? "border-green-200 bg-green-50/50"
                        : "border-slate-200 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Step number */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-500"
                            : `bg-gradient-to-br ${getImpactColor(step.impact)}`
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.order
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className={`font-semibold text-lg ${isCompleted ? "line-through text-slate-400" : ""}`}>
                            {step.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactBadge(step.impact)}`}>
                            {step.impact} IMPACT
                          </span>
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                            {getCategoryIcon(step.category)}
                            {step.category.replace("_", " ")}
                          </span>
                        </div>
                        <p className={`text-slate-600 mb-3 ${isCompleted ? "line-through text-slate-400" : ""}`}>
                          {step.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Timeframe: {step.timeframe}
                          </span>
                          <button
                            onClick={() => toggleStepComplete(step.order)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              isCompleted
                                ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
                            }`}
                          >
                            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-4">Pro Tips for Credit Improvement</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Keep credit utilization below 30%, ideally under 10% for best results.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pay all bills on time - payment history is 35% of your score.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Don&apos;t close old credit cards - length of credit history matters.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Limit hard inquiries - only apply for credit when necessary.</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
