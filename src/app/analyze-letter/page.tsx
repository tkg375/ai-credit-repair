"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface RecommendedAction {
  action: string;
  priority: Priority;
  description: string;
}

interface LetterAnalysis {
  creditorName: string | null;
  letterDate: string | null;
  letterType: string;
  keyClaimsAndDemands: string[];
  amountClaimed: number | null;
  deadline: string | null;
  yourLegalRights: string[];
  recommendedActions: RecommendedAction[];
  draftResponseLetter: string;
}

type PageState = "idle" | "analyzing" | "results";

const ACCEPTED_TYPES = "application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp";

const LETTER_TYPE_LABELS: Record<string, string> = {
  collection_notice: "Collection Notice",
  demand_letter: "Demand Letter",
  settlement_offer: "Settlement Offer",
  judgment_notice: "Judgment Notice",
  debt_validation_response: "Debt Validation Response",
  cease_and_desist_response: "Cease & Desist Response",
  other: "Other",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: "bg-red-100 text-red-700 border border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border border-amber-200",
  LOW: "bg-slate-100 text-slate-600 border border-slate-200",
};

function isValidFile(file: File): boolean {
  const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const validExts = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  const name = file.name.toLowerCase();
  return validTypes.includes(file.type) || validExts.some((ext) => name.endsWith(ext));
}

export default function AnalyzeLetterPage() {
  const { user } = useAuth();
  const [pageState, setPageState] = useState<PageState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<LetterAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");
    if (e.dataTransfer.files?.[0]) {
      const dropped = e.dataTransfer.files[0];
      if (isValidFile(dropped)) {
        setFile(dropped);
      } else {
        setError("Please upload a PDF or image file (JPG, PNG, WebP)");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (isValidFile(selected)) {
        setFile(selected);
      } else {
        setError("Please upload a PDF or image file (JPG, PNG, WebP)");
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) return;

    setPageState("analyzing");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/letters/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.idToken}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze letter");
      }

      setAnalysis(data.analysis);
      setPageState("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze letter");
      setPageState("idle");
    }
  };

  const handleCopyLetter = async () => {
    if (!analysis?.draftResponseLetter) return;
    await navigator.clipboard.writeText(analysis.draftResponseLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPageState("idle");
    setFile(null);
    setAnalysis(null);
    setError("");
    setCopied(false);
  };

  return (
    <AuthenticatedLayout activeNav="analyze-letter">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analyze Creditor Letter</h1>
        <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Upload a letter from a creditor or debt collector. Our AI will explain your rights, identify their claims, and draft a response.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {pageState === "idle" && (
          <>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition ${
                dragActive
                  ? "border-teal-500 bg-teal-50"
                  : file
                  ? "border-green-500 bg-green-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Remove and choose another
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="font-medium">Drag and drop your letter here</p>
                  <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                  <p className="text-xs text-slate-400 mt-2">Supports PDF, JPG, PNG, WebP (scanned letters welcome)</p>
                  <input
                    type="file"
                    accept={ACCEPTED_TYPES}
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {file && (
              <button
                onClick={handleAnalyze}
                className="w-full mt-6 py-3.5 sm:py-4 bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 hover:from-lime-400 hover:via-teal-400 hover:to-cyan-500 text-white rounded-xl font-medium transition text-base sm:text-lg"
              >
                Analyze Letter
              </button>
            )}

            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-600">
              <p className="font-medium mb-1">What gets analyzed:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-500">
                <li>Claims and demands made by the creditor</li>
                <li>Your rights under FCRA, FDCPA, and other consumer laws</li>
                <li>Prioritized actions you should take</li>
                <li>A draft response letter you can send</li>
              </ul>
            </div>
          </>
        )}

        {pageState === "analyzing" && (
          <div className="text-center py-16">
            <div className="w-20 h-20 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Letter</h2>
            <p className="text-slate-600 text-sm">Our AI is reviewing the letter, identifying your rights, and drafting a response...</p>
          </div>
        )}

        {pageState === "results" && analysis && (
          <div className="space-y-6">
            {/* Letter summary bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl text-sm">
              {analysis.creditorName && (
                <span className="font-medium text-slate-700">{analysis.creditorName}</span>
              )}
              <span className="px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                {LETTER_TYPE_LABELS[analysis.letterType] ?? analysis.letterType}
              </span>
              {analysis.amountClaimed !== null && (
                <span className="text-slate-600">
                  Amount: <strong>${analysis.amountClaimed.toLocaleString()}</strong>
                </span>
              )}
              {analysis.deadline && (
                <span className="text-red-600 font-medium">
                  Deadline: {new Date(analysis.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Key Claims & Demands */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Key Claims &amp; Demands
              </h2>
              <ul className="space-y-2">
                {analysis.keyClaimsAndDemands.map((claim, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {claim}
                  </li>
                ))}
              </ul>
            </div>

            {/* Your Legal Rights */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Your Legal Rights
              </h2>
              <ul className="space-y-2">
                {analysis.yourLegalRights.map((right, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    {right}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Recommended Actions
              </h2>
              <div className="space-y-3">
                {analysis.recommendedActions.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[item.priority]}`}>
                        {item.priority}
                      </span>
                      <span className="font-medium text-sm text-slate-800">{item.action}</span>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Draft Response Letter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Draft Response Letter
                </h2>
                <button
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition text-slate-600"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Letter
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 rounded-xl p-4 leading-relaxed">
                {analysis.draftResponseLetter}
              </pre>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Analyze Another Letter
            </button>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  );
}
