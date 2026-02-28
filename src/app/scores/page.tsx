"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import dynamic from "next/dynamic";
import { downloadCSV } from "@/lib/export-csv";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

interface ScoreEntry {
  id: string;
  score: number;
  source: string;
  bureau: string | null;
  recordedAt: string;
}

export default function ScoresPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);

  // Form state
  const [newScore, setNewScore] = useState(700);
  const [newSource, setNewSource] = useState("Credit Karma");
  const [newBureau, setNewBureau] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    fetch("/api/scores", {
      headers: { Authorization: `Bearer ${user.idToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setScores(
          (data.scores || []).map((s: Record<string, unknown>) => ({
            id: s.id as string,
            score: s.score as number,
            source: (s.source as string) || "Unknown",
            bureau: (s.bureau as string) || null,
            recordedAt: (s.recordedAt as string) || "",
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleImportScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/scores/import", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.idToken}` },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to import");
        setScores(prev => [...prev, {
          id: data.id,
          score: data.score,
          source: data.source,
          bureau: data.bureau,
          recordedAt: data.recordedAt,
        }].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()));
        alert(`Score ${data.score} imported successfully!`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to import screenshot.");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleAddScore = async () => {
    if (!user) return;
    setAdding(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
          score: newScore,
          source: newSource,
          bureau: newBureau || null,
          recordedAt: new Date(newDate).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to add score");
      const data = await res.json();
      setScores((prev) => [
        ...prev,
        {
          id: data.id,
          score: newScore,
          source: newSource,
          bureau: newBureau || null,
          recordedAt: new Date(newDate).toISOString(),
        },
      ].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()));
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add score entry.");
    } finally {
      setAdding(false);
    }
  };

  const chartData = scores.map((s) => ({
    date: new Date(s.recordedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    score: s.score,
  }));

  const latestScore = scores.length > 0 ? scores[scores.length - 1].score : null;
  const oldestScore = scores.length > 1 ? scores[0].score : null;
  const change = latestScore && oldestScore ? latestScore - oldestScore : null;

  const target = 800;
  const pointsNeeded = latestScore ? Math.max(0, target - latestScore) : null;
  const progressPct = latestScore ? Math.min(100, ((latestScore - 300) / (target - 300)) * 100) : 0;
  const monthlyRate = change && scores.length > 1
    ? change / Math.max(1, (new Date(scores[scores.length - 1].recordedAt).getTime() - new Date(scores[0].recordedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null;
  const monthsTo800 = monthlyRate && monthlyRate > 0 && pointsNeeded ? Math.ceil(pointsNeeded / monthlyRate) : null;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="scores">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Score Tracking
            </h1>
            <p className="text-slate-500 mt-1">Track your credit score over time</p>
          </div>
          <div className="flex gap-2">
            <label className={`px-3 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 ${importing ? "opacity-50 pointer-events-none" : ""}`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="hidden sm:inline">{importing ? "Scanning..." : "Import Screenshot"}</span>
              <span className="sm:hidden">{importing ? "Scanning..." : "Import"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImportScreenshot} disabled={importing} />
            </label>
            <button
              onClick={() => downloadCSV("credit-scores.csv", scores.map(s => ({
                score: s.score,
                source: s.source,
                bureau: s.bureau || "",
                recordedAt: s.recordedAt,
              })))}
              disabled={scores.length === 0}
              className="px-3 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition disabled:opacity-40 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-2 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              + Add Score
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {latestScore && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Current Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-lime-500 to-teal-600 bg-clip-text text-transparent">{latestScore}</p>
              </div>
              {change !== null && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Total Change</p>
                  <p className={`text-3xl font-bold ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "+" : ""}{change}
                  </p>
                </div>
              )}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Points to 800</p>
                <p className="text-3xl font-bold text-slate-900">{pointsNeeded}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Entries</p>
                <p className="text-3xl font-bold text-slate-900">{scores.length}</p>
              </div>
            </div>

            {/* Path to 800 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Path to 800</h2>
                {monthsTo800 && <span className="text-sm text-teal-600 font-medium">~{monthsTo800} months at current pace</span>}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-slate-500 w-8">{latestScore}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-8">800</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Fair", range: "580–669", color: "bg-red-100 text-red-700" },
                  { label: "Good", range: "670–739", color: "bg-amber-100 text-amber-700" },
                  { label: "Very Good", range: "740–799", color: "bg-lime-100 text-lime-700" },
                ].map((tier) => (
                  <div key={tier.label} className={`rounded-lg p-2 text-center ${tier.color}`}>
                    <p className="text-xs font-semibold">{tier.label}</p>
                    <p className="text-xs">{tier.range}</p>
                  </div>
                ))}
              </div>
              {monthlyRate !== null && monthlyRate > 0 && (
                <p className="text-xs text-slate-500 mt-3">
                  Based on your average improvement of +{monthlyRate.toFixed(1)} pts/month. Disputed items typically add 20–100 points each when removed.
                </p>
              )}
              {scores.length < 2 && (
                <p className="text-xs text-slate-500 mt-3">Add at least 2 score entries to see your projected timeline.</p>
              )}
            </div>
          </>
        )}

        {/* Add Score Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold mb-4">Add Score Entry</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Score</label>
                <input
                  type="number"
                  min={300}
                  max={850}
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option>Credit Karma</option>
                  <option>Experian</option>
                  <option>MyFICO</option>
                  <option>TransUnion</option>
                  <option>Bank/Card Issuer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bureau (optional)</label>
                <select
                  value={newBureau}
                  onChange={(e) => setNewBureau(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Not specified</option>
                  <option>Equifax</option>
                  <option>Experian</option>
                  <option>TransUnion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddScore}
                disabled={adding}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition disabled:opacity-50"
              >
                {adding ? "Saving..." : "Save Entry"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Chart */}
        {scores.length > 1 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="font-semibold mb-4">Score History</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[300, 850]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} dot={{ fill: "#14b8a6", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Score Data Yet</h3>
            <p className="text-slate-500 mb-4">Add your first score entry to start tracking progress.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              Add Your First Score
            </button>
          </div>
        ) : null}

        {/* Score History Table */}
        {scores.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold">All Entries</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-slate-500 text-xs sm:text-sm">Date</th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-slate-500 text-xs sm:text-sm">Score</th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-slate-500 text-xs sm:text-sm">Source</th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-slate-500 text-xs sm:text-sm">Bureau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...scores].reverse().map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">{new Date(s.recordedAt).toLocaleDateString()}</td>
                      <td className="px-3 sm:px-6 py-3 font-bold text-xs sm:text-sm">{s.score}</td>
                      <td className="px-3 sm:px-6 py-3 text-slate-600 text-xs sm:text-sm">{s.source}</td>
                      <td className="px-3 sm:px-6 py-3 text-slate-600 text-xs sm:text-sm">{s.bureau || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  );
}
