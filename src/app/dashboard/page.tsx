"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { OnboardingModal } from "@/components/OnboardingModal";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface Dispute {
  id: string;
  bureau: string;
  reason: string;
  status: string;
}

// Firestore REST API helpers
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
  limitCount?: number,
  additionalFilters?: { field: string; op: string; value: unknown }[]
) {
  const filters = [
    {
      fieldFilter: {
        field: { fieldPath: "userId" },
        op: "EQUAL",
        value: { stringValue: userId },
      },
    },
    ...(additionalFilters || []).map((f) => ({
      fieldFilter: {
        field: { fieldPath: f.field },
        op: f.op,
        value: typeof f.value === "boolean" ? { booleanValue: f.value } : { stringValue: f.value },
      },
    })),
  ];

  // Simplified query without orderBy to avoid composite index requirement
  const query: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } },
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

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [disputableCount, setDisputableCount] = useState(0);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadDashboard() {
      try {
        // Load latest score
        const scores = await queryCollection(user!.idToken, "creditScores", user!.uid, "recordedAt", 1);
        if (scores.length > 0) {
          setLatestScore(scores[0].score as number);
        }

        // Load disputable items count
        const items = await queryCollection(user!.idToken, "reportItems", user!.uid, undefined, undefined, [
          { field: "isDisputable", op: "EQUAL", value: true },
        ]);
        setDisputableCount(items.length);

        // Load recent disputes
        const disputeDocs = await queryCollection(user!.idToken, "disputes", user!.uid, "createdAt", 10);
        setDisputes(
          disputeDocs.map((d: Record<string, unknown> & { id: string }) => ({
            id: d.id,
            bureau: d.bureau as string,
            reason: d.reason as string,
            status: d.status as string,
          }))
        );

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const activeDisputes = disputes.filter(
    (d) => d.status === "SENT" || d.status === "UNDER_INVESTIGATION"
  ).length;

  return (
    <AuthenticatedLayout activeNav="dashboard">
      <OnboardingModal />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
            <p className="text-sm text-slate-500 mb-1">Latest Score</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">
              {latestScore ?? "---"}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
            <p className="text-sm text-slate-500 mb-1">Disputable Items</p>
            <p className="text-4xl font-bold text-amber-500">
              {disputableCount}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
            <p className="text-sm text-slate-500 mb-1">Active Disputes</p>
            <p className="text-4xl font-bold text-emerald-500">
              {activeDisputes}
            </p>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Disputes</h2>
            <Link
              href="/disputes"
              className="text-sm text-teal-600 hover:text-lime-600 transition"
            >
              View all
            </Link>
          </div>
          {disputes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-4">No disputes yet. Upload a credit report to get started.</p>
              <Link
                href="/upload"
                className="inline-block px-6 py-2 bg-gradient-to-r from-lime-500 to-teal-600 rounded-lg text-sm text-white font-medium hover:from-lime-400 hover:to-teal-500 transition"
              >
                Upload Report
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div
                  key={d.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium">{d.bureau}</p>
                    <p className="text-sm text-slate-500">{d.reason}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      d.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : d.status === "SENT" ||
                            d.status === "UNDER_INVESTIGATION"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </AuthenticatedLayout>
  );
}
