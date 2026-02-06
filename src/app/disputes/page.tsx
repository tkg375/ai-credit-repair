"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface RemovalStrategy {
  method: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  successRate: string;
}

interface ReportItem {
  id: string;
  creditorName: string;
  originalCreditor: string | null;
  accountNumber: string;
  accountType: string;
  balance: number;
  originalBalance: number | null;
  status: string;
  dateOfFirstDelinquency: string | null;
  lastActivityDate: string | null;
  isDisputable: boolean;
  disputeReason: string | null;
  removalStrategies: RemovalStrategy[];
  bureau: string;
}

interface Dispute {
  id: string;
  itemId: string;
  creditorName: string;
  bureau: string;
  reason: string;
  status: string;
  letterContent: string | null;
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

  const query: Record<string, unknown> = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: filters.length === 1
        ? filters[0]
        : { compositeFilter: { op: "AND", filters } },
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

export default function DisputesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"disputable" | "disputes">("disputable");
  const [disputableItems, setDisputableItems] = useState<ReportItem[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        // Load ALL report items to analyze for removal
        const items = await queryCollection(user!.idToken, "reportItems", user!.uid, []);
        setDisputableItems(
          items
            .filter((item: Record<string, unknown>) => item.isDisputable === true)
            .map((item: Record<string, unknown> & { id: string }) => ({
              id: item.id,
              creditorName: item.creditorName as string,
              originalCreditor: (item.originalCreditor as string) || null,
              accountNumber: item.accountNumber as string,
              accountType: item.accountType as string,
              balance: item.balance as number,
              originalBalance: (item.originalBalance as number) || null,
              status: item.status as string,
              dateOfFirstDelinquency: (item.dateOfFirstDelinquency as string) || null,
              lastActivityDate: (item.lastActivityDate as string) || null,
              isDisputable: item.isDisputable as boolean,
              disputeReason: item.disputeReason as string | null,
              removalStrategies: (item.removalStrategies as RemovalStrategy[]) || [],
              bureau: item.bureau as string,
            }))
        );

        // Load existing disputes
        const disputeDocs = await queryCollection(user!.idToken, "disputes", user!.uid);
        setDisputes(
          disputeDocs.map((d: Record<string, unknown> & { id: string }) => ({
            id: d.id,
            itemId: d.itemId as string,
            creditorName: d.creditorName as string,
            bureau: d.bureau as string,
            reason: d.reason as string,
            status: d.status as string,
            letterContent: d.letterContent as string | null,
            createdAt: d.createdAt as Date,
          }))
        );
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, router]);

  const handleGenerateDispute = async (item: ReportItem) => {
    if (!user) return;

    setGenerating(item.id);

    try {
      const res = await fetch("/api/disputes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          creditorName: item.creditorName,
          accountNumber: item.accountNumber,
          bureau: item.bureau,
          reason: item.disputeReason,
          balance: item.balance,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate dispute");

      const data = await res.json();

      // Add new dispute to list
      setDisputes((prev) => [
        {
          id: data.disputeId,
          itemId: item.id,
          creditorName: item.creditorName,
          bureau: item.bureau,
          reason: item.disputeReason || "Inaccurate information",
          status: "DRAFT",
          letterContent: data.letterContent,
          createdAt: new Date(),
        },
        ...prev,
      ]);

      // Remove from disputable items
      setDisputableItems((prev) => prev.filter((i) => i.id !== item.id));

      setActiveTab("disputes");
    } catch (err) {
      console.error(err);
      alert("Failed to generate dispute letter. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const handleDeleteDispute = async (disputeId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this dispute?")) return;

    setDeleting(disputeId);

    try {
      // Delete from Firestore
      const res = await fetch(`${FIRESTORE_BASE}/disputes/${disputeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete dispute");
      }

      // Remove from local state
      setDisputes((prev) => prev.filter((d) => d.id !== disputeId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete dispute. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700";
      case "SENT":
        return "bg-blue-100 text-blue-700";
      case "UNDER_INVESTIGATION":
        return "bg-amber-100 text-amber-700";
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
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
          <Link href="/plan" className="text-slate-600 hover:text-blue-600 transition">
            Action Plan
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Disputes</h1>
        <p className="text-slate-600 mb-8">
          Review disputable items and generate FCRA-compliant dispute letters.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("disputable")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === "disputable"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            Disputable Items ({disputableItems.length})
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === "disputes"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            My Disputes ({disputes.length})
          </button>
        </div>

        {activeTab === "disputable" ? (
          <div>
            {disputableItems.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Disputable Items</h3>
                <p className="text-slate-500 mb-6">Upload a credit report to find items you can dispute.</p>
                <Link
                  href="/upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition"
                >
                  Upload Report
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Removal Analysis Summary */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Credit Report Removal Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">{disputableItems.length}</div>
                      <div className="text-sm text-emerald-100">Items to Dispute</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">
                        ${disputableItems.reduce((sum, item) => sum + item.balance, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-emerald-100">Potential Removal</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">
                        {disputableItems.reduce((sum, item) =>
                          sum + (item.removalStrategies?.filter(s => s.priority === "HIGH").length || 0), 0
                        )}
                      </div>
                      <div className="text-sm text-emerald-100">High Priority Strategies</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">
                        {disputableItems.reduce((sum, item) =>
                          sum + (item.removalStrategies?.length || 0), 0
                        )}
                      </div>
                      <div className="text-sm text-emerald-100">Total Strategies</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-emerald-100">
                    Our AI has analyzed each debt and identified the best removal strategies based on account age, debt type, and legal factors.
                  </p>
                </div>

                {/* Individual Items */}
                <div className="space-y-4">
                {disputableItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.creditorName}</h3>
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {item.bureau}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          Account: ****{item.accountNumber.slice(-4)} • {item.accountType}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-600">
                            Balance: <span className="font-medium">${item.balance.toLocaleString()}</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "DELINQUENT" ? "bg-red-100 text-red-700" :
                            item.status === "COLLECTION" ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        {item.disputeReason && (
                          <p className="mt-3 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                            <strong>Suggested Dispute Reason:</strong> {item.disputeReason}
                          </p>
                        )}

                        {/* Removal Strategies Section */}
                        {item.removalStrategies && item.removalStrategies.length > 0 && (
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Removal Strategies Analysis
                            </h4>
                            <div className="space-y-3">
                              {item.removalStrategies.map((strategy, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg border ${
                                    strategy.priority === "HIGH"
                                      ? "bg-emerald-50 border-emerald-200"
                                      : strategy.priority === "MEDIUM"
                                      ? "bg-blue-50 border-blue-200"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-800">{strategy.method}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          strategy.priority === "HIGH"
                                            ? "bg-emerald-200 text-emerald-800"
                                            : strategy.priority === "MEDIUM"
                                            ? "bg-blue-200 text-blue-800"
                                            : "bg-slate-200 text-slate-700"
                                        }`}>
                                          {strategy.priority}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-600">{strategy.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="text-xs text-slate-500">Success Rate</div>
                                      <div className={`text-lg font-bold ${
                                        parseInt(strategy.successRate) >= 70
                                          ? "text-emerald-600"
                                          : parseInt(strategy.successRate) >= 50
                                          ? "text-blue-600"
                                          : "text-slate-600"
                                      }`}>
                                        {strategy.successRate}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Original Creditor Info */}
                        {item.originalCreditor && (
                          <p className="mt-3 text-xs text-slate-500">
                            Original Creditor: <span className="font-medium">{item.originalCreditor}</span>
                          </p>
                        )}

                        {/* Date Info */}
                        {(item.dateOfFirstDelinquency || item.lastActivityDate) && (
                          <div className="mt-2 flex gap-4 text-xs text-slate-500">
                            {item.dateOfFirstDelinquency && (
                              <span>First Delinquency: {new Date(item.dateOfFirstDelinquency).toLocaleDateString()}</span>
                            )}
                            {item.lastActivityDate && (
                              <span>Last Activity: {new Date(item.lastActivityDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 ml-4">
                        <button
                          onClick={() => handleGenerateDispute(item)}
                          disabled={generating === item.id}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition disabled:opacity-50"
                        >
                          {generating === item.id ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </span>
                          ) : (
                            "Generate Dispute"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {disputes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Disputes Yet</h3>
                <p className="text-slate-500">Generate disputes from your disputable items.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{dispute.creditorName}</h3>
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {dispute.bureau}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{dispute.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg font-medium hover:border-slate-300 hover:bg-slate-50 transition"
                        >
                          View Letter
                        </button>
                        <button
                          onClick={() => handleDeleteDispute(dispute.id)}
                          disabled={deleting === dispute.id}
                          className="px-3 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:border-red-300 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {deleting === dispute.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Letter Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Dispute Letter</h2>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {selectedDispute.letterContent || "Letter content not available."}
                </pre>
              </div>
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDispute.letterContent || "");
                    alert("Letter copied to clipboard!");
                  }}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([selectedDispute.letterContent || ""], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `dispute-${selectedDispute.bureau}-${Date.now()}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition"
                >
                  Download Letter
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
