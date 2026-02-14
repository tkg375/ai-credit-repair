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
  addressSource: string | null;
  addressConfidence: string | null;
  mailJobId: string | null;
  mailStatus: string | null;
  mailError: string | null;
  mailedAt: string | null;
  mailTracking: { barcode?: string; status?: string; lastUpdate?: string } | null;
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
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [strategyPicker, setStrategyPicker] = useState<string | null>(null);
  const [mailing, setMailing] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<string | null>(null);

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
          disputeDocs.map((d: Record<string, unknown> & { id: string }) => {
            const addrData = d.creditorAddress as Record<string, unknown> | null;
            // Detect address source from Firestore data, or infer from letter content
            let addressSource: string | null = null;
            let addressConfidence: string | null = null;
            if (addrData && typeof addrData === "object" && addrData.source) {
              addressSource = addrData.source as string;
              addressConfidence = (addrData.confidence as string) || null;
            } else if (d.letterContent && typeof d.letterContent === "string" && !String(d.letterContent).includes("[Insert Creditor")) {
              // Letter has a real address but was generated before we stored metadata
              addressSource = "database";
            }
            const mailTrackingData = d.mailTracking as Record<string, unknown> | null;
            return {
              id: d.id,
              itemId: d.itemId as string,
              creditorName: d.creditorName as string,
              bureau: d.bureau as string,
              reason: d.reason as string,
              status: d.status as string,
              letterContent: d.letterContent as string | null,
              createdAt: d.createdAt as Date,
              addressSource,
              addressConfidence,
              mailJobId: (d.mailJobId as string) || null,
              mailStatus: (d.mailStatus as string) || null,
              mailError: (d.mailError as string) || null,
              mailedAt: (d.mailedAt as string) || null,
              mailTracking: mailTrackingData ? {
                barcode: (mailTrackingData.barcode as string) || undefined,
                status: (mailTrackingData.status as string) || undefined,
                lastUpdate: (mailTrackingData.lastUpdate as string) || undefined,
              } : null,
            };
          })
        );
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, authLoading, router]);

  const handleGenerateDispute = async (item: ReportItem, strategyMethod?: string) => {
    if (!user) return;

    setGenerating(item.id);
    setStrategyPicker(null);

    const reason = strategyMethod || item.disputeReason;

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
          reason,
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
          reason: reason || "Inaccurate information",
          status: "DRAFT",
          letterContent: data.letterContent,
          createdAt: new Date(),
          addressSource: data.addressSource || null,
          addressConfidence: data.addressConfidence || null,
          mailJobId: null,
          mailStatus: null,
          mailError: null,
          mailedAt: null,
          mailTracking: null,
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

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    if (!confirm("Remove this item from your disputable list?")) return;

    setDeletingItem(itemId);

    try {
      const res = await fetch(`${FIRESTORE_BASE}/reportItems/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      setDisputableItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeletingItem(null);
    }
  };

  const handleMailLetter = async (disputeId: string) => {
    if (!user) return;
    if (!confirm("Mail this dispute letter via USPS? The letter will be printed and mailed to the creditor.")) return;

    setMailing(disputeId);

    try {
      const res = await fetch("/api/disputes/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ disputeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to mail letter");
      }

      // Update local state
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? { ...d, mailJobId: data.mailJobId, mailStatus: "SUBMITTED", status: "SENT", mailedAt: new Date().toISOString() }
            : d
        )
      );

      // Also update selectedDispute if viewing
      if (selectedDispute?.id === disputeId) {
        setSelectedDispute((prev) =>
          prev ? { ...prev, mailJobId: data.mailJobId, mailStatus: "SUBMITTED", status: "SENT", mailedAt: new Date().toISOString() } : prev
        );
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to mail letter. Please try again.");
    } finally {
      setMailing(null);
    }
  };

  const handleCheckMailStatus = async (disputeId: string) => {
    if (!user) return;

    setCheckingStatus(disputeId);

    try {
      const res = await fetch(`/api/disputes/mail/status?disputeId=${disputeId}`, {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check status");
      }

      // Update local state
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? { ...d, mailStatus: data.mailStatus, mailTracking: data.tracking }
            : d
        )
      );

      if (selectedDispute?.id === disputeId) {
        setSelectedDispute((prev) =>
          prev ? { ...prev, mailStatus: data.mailStatus, mailTracking: data.tracking } : prev
        );
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to check mail status.");
    } finally {
      setCheckingStatus(null);
    }
  };

  const getMailStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";
      case "IN_PRODUCTION":
        return "bg-amber-100 text-amber-700";
      case "MAILED":
        return "bg-green-100 text-green-700";
      case "ERROR":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
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
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto border-b border-slate-200">
        <Link href="/">
          <Logo className="h-7 sm:h-8 w-auto" />
        </Link>
        <div className="hidden md:flex gap-4 text-sm items-center">
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
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>
      {menuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link href="/dashboard" className="block text-slate-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/upload" className="block text-slate-600" onClick={() => setMenuOpen(false)}>Upload Report</Link>
            <Link href="/tools" className="block text-slate-600" onClick={() => setMenuOpen(false)}>Credit Tools</Link>
            <Link href="/plan" className="block text-slate-600" onClick={() => setMenuOpen(false)}>Action Plan</Link>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Disputes</h1>
        <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Review disputable items and generate FCRA-compliant dispute letters.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("disputable")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition text-sm sm:text-base ${
              activeTab === "disputable"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            Disputable Items ({disputableItems.length})
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition text-sm sm:text-base ${
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold">{disputableItems.length}</div>
                      <div className="text-xs sm:text-sm text-emerald-100">Items to Dispute</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold truncate">
                        ${disputableItems.reduce((sum, item) => sum + item.balance, 0).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-100">Potential Removal</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold">
                        {disputableItems.reduce((sum, item) =>
                          sum + (item.removalStrategies?.filter(s => s.priority === "HIGH").length || 0), 0
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-100">High Priority Strategies</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold">
                        {disputableItems.reduce((sum, item) =>
                          sum + (item.removalStrategies?.length || 0), 0
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-100">Total Strategies</div>
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
                    className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg">{item.creditorName}</h3>
                          {item.bureau && item.bureau !== "UNKNOWN" && (
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                              {item.bureau}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          Account: ****{item.accountNumber.slice(-4)} • {item.accountType}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
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
                            {/* Best Strategy - Highlighted */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Best Removal Strategy
                              </h4>
                              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="font-semibold text-emerald-900 text-base">{item.removalStrategies[0].method}</span>
                                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-white">
                                        RECOMMENDED
                                      </span>
                                    </div>
                                    <p className="text-sm text-emerald-800">{item.removalStrategies[0].description}</p>
                                  </div>
                                  <div className="flex items-center gap-2 sm:block sm:text-right shrink-0">
                                    <div className="text-xs text-emerald-600 font-medium">Success Rate</div>
                                    <div className="text-2xl font-bold text-emerald-600">
                                      {item.removalStrategies[0].successRate}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Other Strategies */}
                            {item.removalStrategies.length > 1 && (
                              <details className="group">
                                <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 flex items-center gap-2 mb-3">
                                  <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  {item.removalStrategies.length - 1} Other Strategies
                                </summary>
                                <div className="space-y-2 ml-0 sm:ml-6">
                                  {item.removalStrategies.slice(1).map((strategy, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-lg border ${
                                        strategy.priority === "HIGH"
                                          ? "bg-emerald-50/50 border-emerald-200"
                                          : strategy.priority === "MEDIUM"
                                          ? "bg-blue-50/50 border-blue-200"
                                          : "bg-slate-50/50 border-slate-200"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-700 text-sm">{strategy.method}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                              strategy.priority === "HIGH"
                                                ? "bg-emerald-200 text-emerald-700"
                                                : strategy.priority === "MEDIUM"
                                                ? "bg-blue-200 text-blue-700"
                                                : "bg-slate-200 text-slate-600"
                                            }`}>
                                              {strategy.priority}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-500">{strategy.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <div className={`text-sm font-bold ${
                                            parseInt(strategy.successRate) >= 50
                                              ? "text-emerald-600"
                                              : "text-slate-500"
                                          }`}>
                                            {strategy.successRate}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
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
                          <div className="mt-2 flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-slate-500">
                            {item.dateOfFirstDelinquency && (
                              <span>First Delinquency: {new Date(item.dateOfFirstDelinquency).toLocaleDateString()}</span>
                            )}
                            {item.lastActivityDate && (
                              <span>Last Activity: {new Date(item.lastActivityDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-row sm:flex-col gap-2 relative">
                        {generating === item.id ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-medium disabled:opacity-50"
                          >
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Generating...
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setStrategyPicker(strategyPicker === item.id ? null : item.id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition"
                          >
                            Generate Dispute
                          </button>
                        )}
                        {/* Strategy picker dropdown */}
                        {strategyPicker === item.id && (
                          <div className="absolute top-10 right-0 sm:right-0 left-0 sm:left-auto z-20 bg-white border border-slate-200 rounded-xl shadow-xl sm:w-72 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                              <p className="text-xs font-semibold text-slate-600">Choose dispute type:</p>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {item.removalStrategies && item.removalStrategies.length > 0 ? (
                                item.removalStrategies.map((strategy, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleGenerateDispute(item, strategy.method)}
                                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition border-b border-slate-100 last:border-b-0"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                        strategy.priority === "HIGH"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : strategy.priority === "MEDIUM"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}>
                                        {strategy.priority}
                                      </span>
                                      <span className="text-sm font-medium text-slate-800 truncate">{strategy.method}</span>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <button
                                  onClick={() => handleGenerateDispute(item)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition"
                                >
                                  <span className="text-sm font-medium text-slate-800">General Dispute Letter</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deletingItem === item.id}
                          className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg font-medium hover:border-red-300 hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {deletingItem === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </>
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{dispute.creditorName}</h3>
                          {dispute.bureau && dispute.bureau !== "UNKNOWN" && (
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                              {dispute.bureau}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace("_", " ")}
                          </span>
                          {dispute.mailStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${getMailStatusColor(dispute.mailStatus)}`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {dispute.mailStatus === "MAILED" ? "DELIVERED TO USPS" : `MAIL: ${dispute.mailStatus}`}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{dispute.reason}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
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
                {/* Address confidence banner */}
                {selectedDispute.addressSource === "database" && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Creditor address verified from our database
                  </div>
                )}
                {selectedDispute.addressSource === "ai" && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Address found via AI search — please verify before sending
                  </div>
                )}
                {!selectedDispute.addressSource && selectedDispute.letterContent?.includes("[Insert Creditor") && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    This letter was generated before address auto-lookup. Delete and re-generate to fill in the address automatically.
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {selectedDispute.letterContent || "Letter content not available."}
                </pre>
              </div>
              {/* Mail status banner */}
              {selectedDispute.mailStatus && (
                <div className={`px-6 py-3 border-t flex items-center justify-between ${
                  selectedDispute.mailStatus === "MAILED" ? "bg-green-50" :
                  selectedDispute.mailStatus === "ERROR" ? "bg-red-50" :
                  "bg-blue-50"
                }`}>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">
                      {selectedDispute.mailStatus === "SUBMITTED" && "Letter submitted for mailing"}
                      {selectedDispute.mailStatus === "IN_PRODUCTION" && "Letter is being printed"}
                      {selectedDispute.mailStatus === "MAILED" && "Letter delivered to USPS"}
                      {selectedDispute.mailStatus === "ERROR" && `Mailing error: ${selectedDispute.mailError || "Unknown error"}`}
                    </span>
                  </div>
                  {selectedDispute.mailStatus !== "ERROR" && (
                    <button
                      onClick={() => handleCheckMailStatus(selectedDispute.id)}
                      disabled={checkingStatus === selectedDispute.id}
                      className="text-sm px-3 py-1 border rounded-lg hover:bg-white transition disabled:opacity-50"
                    >
                      {checkingStatus === selectedDispute.id ? "Checking..." : "Refresh Status"}
                    </button>
                  )}
                </div>
              )}
              {selectedDispute.mailTracking?.status && (
                <div className="px-6 py-2 bg-slate-50 border-t text-xs text-slate-600 flex items-center gap-4">
                  <span>USPS: {selectedDispute.mailTracking.status}</span>
                  {selectedDispute.mailTracking.lastUpdate && (
                    <span>Updated: {selectedDispute.mailTracking.lastUpdate}</span>
                  )}
                </div>
              )}
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
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Download Letter
                </button>
                {!selectedDispute.mailJobId && selectedDispute.addressSource && (
                  <button
                    onClick={() => handleMailLetter(selectedDispute.id)}
                    disabled={mailing === selectedDispute.id}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {mailing === selectedDispute.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Mailing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Mail via USPS
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
