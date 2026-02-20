"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import {
  STATUTE_OF_LIMITATIONS,
  STATE_NAMES,
  generateLetter,
  isDebtExpired,
  getCreditReportRemovalDate,
  type LetterType,
} from "@/lib/credit-tools";

const LETTER_TYPES: { value: LetterType; label: string; description: string }[] = [
  {
    value: "debt_validation",
    label: "Debt Validation Letter",
    description: "Force collectors to prove they own the debt. They have 30 days to respond or must stop collecting.",
  },
  {
    value: "pay_for_delete",
    label: "Pay-for-Delete Offer",
    description: "Negotiate to pay a reduced amount in exchange for complete removal from credit reports.",
  },
  {
    value: "goodwill",
    label: "Goodwill Letter",
    description: "Request removal of a late payment based on your positive history with the creditor.",
  },
  {
    value: "method_of_verification",
    label: "Method of Verification",
    description: "After a dispute, demand proof of HOW the bureau verified the debt. Often leads to deletion.",
  },
  {
    value: "original_creditor_request",
    label: "Original Creditor Request",
    description: "Demand the original signed contract. Debt buyers often can't produce this documentation.",
  },
  {
    value: "cease_and_desist",
    label: "Cease & Desist",
    description: "Legally stop all collection calls and letters. They can only contact you about legal action.",
  },
  {
    value: "debt_dispute",
    label: "Bureau Dispute Letter",
    description: "Standard dispute letter to credit bureaus for inaccurate information.",
  },
];

export default function ToolsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"letters" | "sol" | "calculator">("letters");
  const [menuOpen, setMenuOpen] = useState(false);

  // Letter generator state
  const [letterType, setLetterType] = useState<LetterType>("debt_validation");
  const [creditorName, setCreditorName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [offerPercent, setOfferPercent] = useState(40);
  const [bureau, setBureau] = useState("EQUIFAX");
  const [reason, setReason] = useState("");
  const [latePaymentDate, setLatePaymentDate] = useState("");
  const [circumstance, setCircumstance] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");

  // SOL calculator state
  const [solState, setSolState] = useState("CA");
  const [debtType, setDebtType] = useState<"written" | "oral" | "promissory" | "openEnded">("openEnded");
  const [lastActivityDate, setLastActivityDate] = useState("");
  const [solResult, setSolResult] = useState<{ expired: boolean; expirationDate: Date; daysRemaining: number } | null>(null);

  // Credit report removal calculator
  const [firstDelinquencyDate, setFirstDelinquencyDate] = useState("");
  const [removalDate, setRemovalDate] = useState<Date | null>(null);

  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleGenerateLetter = () => {
    const balanceNum = parseFloat(balance) || 0;
    const letter = generateLetter(letterType, {
      userName: user?.email?.split("@")[0] || "Consumer",
      creditorName: creditorName || "[Creditor Name]",
      accountNumber: accountNumber || "[Account Number]",
      balance: balanceNum,
      offerAmount: Math.round(balanceNum * (offerPercent / 100)),
      bureau,
      reason,
      latePaymentDate,
      circumstance,
    });
    setGeneratedLetter(letter);
  };

  const handleCalculateSOL = () => {
    if (!lastActivityDate) return;
    const result = isDebtExpired(solState, debtType, new Date(lastActivityDate));
    setSolResult(result);
  };

  const handleCalculateRemoval = () => {
    if (!firstDelinquencyDate) return;
    const date = getCreditReportRemovalDate(new Date(firstDelinquencyDate));
    setRemovalDate(date);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
  };

  const selectedLetterInfo = LETTER_TYPES.find((l) => l.value === letterType);

  return (
    <AuthenticatedLayout activeNav="tools">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Credit Repair Tools</h1>
        <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Powerful tools to help you dispute debts, negotiate settlements, and understand your rights.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("letters")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "letters"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Letter Generator
          </button>
          <button
            onClick={() => setActiveTab("sol")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "sol"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Statute of Limitations
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-3 font-medium transition ${
              activeTab === "calculator"
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Removal Date Calculator
          </button>
        </div>

        {/* Letter Generator Tab */}
        {activeTab === "letters" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Generate Letter</h2>

              {/* Letter Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Letter Type</label>
                <div className="space-y-2">
                  {LETTER_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`block p-4 rounded-xl border-2 cursor-pointer transition ${
                        letterType === type.value
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="letterType"
                        value={type.value}
                        checked={letterType === type.value}
                        onChange={(e) => setLetterType(e.target.value as LetterType)}
                        className="sr-only"
                      />
                      <span className="font-medium">{type.label}</span>
                      <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Creditor/Collection Agency Name</label>
                  <input
                    type="text"
                    value={creditorName}
                    onChange={(e) => setCreditorName(e.target.value)}
                    placeholder="e.g., Midland Credit Management"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g., ****1234"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Balance Owed</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="e.g., 1500"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                {letterType === "pay_for_delete" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Offer Percentage: {offerPercent}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={offerPercent}
                      onChange={(e) => setOfferPercent(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-slate-500">
                      Offer amount: ${balance ? Math.round(parseFloat(balance) * (offerPercent / 100)).toLocaleString() : "0"}
                    </p>
                  </div>
                )}

                {(letterType === "method_of_verification" || letterType === "debt_dispute") && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Credit Bureau</label>
                    <select
                      value={bureau}
                      onChange={(e) => setBureau(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    >
                      <option value="EQUIFAX">Equifax</option>
                      <option value="EXPERIAN">Experian</option>
                      <option value="TRANSUNION">TransUnion</option>
                    </select>
                  </div>
                )}

                {letterType === "debt_dispute" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for Dispute</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why this information is inaccurate..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>
                )}

                {letterType === "goodwill" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Late Payment Date</label>
                      <input
                        type="date"
                        value={latePaymentDate}
                        onChange={(e) => setLatePaymentDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Circumstances (optional)</label>
                      <textarea
                        value={circumstance}
                        onChange={(e) => setCircumstance(e.target.value)}
                        placeholder="e.g., I was hospitalized and unable to make the payment on time..."
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleGenerateLetter}
                  className="w-full py-3 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:from-lime-400 hover:to-teal-500 transition"
                >
                  Generate Letter
                </button>
              </div>
            </div>

            {/* Generated Letter Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                {generatedLetter && (
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Copy to Clipboard
                  </button>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[600px] shadow-sm">
                {generatedLetter ? (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">
                    {generatedLetter}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Fill out the form and click Generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statute of Limitations Tab */}
        {activeTab === "sol" && (
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Check Statute of Limitations</h2>
              <p className="text-slate-600 mb-6">
                If a debt is past the statute of limitations, collectors cannot sue you to collect it.
                However, making a payment can restart the clock!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your State</label>
                  <select
                    value={solState}
                    onChange={(e) => setSolState(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    {Object.entries(STATE_NAMES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type of Debt</label>
                  <select
                    value={debtType}
                    onChange={(e) => setDebtType(e.target.value as typeof debtType)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="openEnded">Credit Cards / Open-Ended Accounts</option>
                    <option value="written">Written Contracts (Auto Loans, Personal Loans)</option>
                    <option value="oral">Oral Agreements</option>
                    <option value="promissory">Promissory Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date of Last Activity</label>
                  <input
                    type="date"
                    value={lastActivityDate}
                    onChange={(e) => setLastActivityDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This is typically your last payment or last charge on the account
                  </p>
                </div>

                <button
                  onClick={handleCalculateSOL}
                  className="w-full py-3 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:from-lime-400 hover:to-teal-500 transition"
                >
                  Check Status
                </button>
              </div>

              {solResult && (
                <div className={`mt-6 p-6 rounded-xl ${solResult.expired ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                  {solResult.expired ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-700">Debt is Time-Barred!</h3>
                      </div>
                      <p className="text-green-700">
                        The statute of limitations expired on{" "}
                        <strong>{solResult.expirationDate.toLocaleDateString()}</strong>.
                        Collectors cannot sue you for this debt.
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        Warning: Making ANY payment could restart the statute of limitations!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-amber-700">Debt is Still Active</h3>
                      </div>
                      <p className="text-amber-700">
                        The statute of limitations expires on{" "}
                        <strong>{solResult.expirationDate.toLocaleDateString()}</strong>
                        {" "}({solResult.daysRemaining} days remaining).
                      </p>
                      <p className="text-sm text-amber-600 mt-2">
                        Collectors can still sue you to collect this debt.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SOL Reference Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Statute of Limitations for {STATE_NAMES[solState]}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Credit Cards</p>
                  <p className="text-2xl font-bold">{STATUTE_OF_LIMITATIONS[solState]?.openEnded} years</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Written Contracts</p>
                  <p className="text-2xl font-bold">{STATUTE_OF_LIMITATIONS[solState]?.written} years</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Oral Agreements</p>
                  <p className="text-2xl font-bold">{STATUTE_OF_LIMITATIONS[solState]?.oral} years</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Promissory Notes</p>
                  <p className="text-2xl font-bold">{STATUTE_OF_LIMITATIONS[solState]?.promissory} years</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removal Date Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Credit Report Removal Date</h2>
              <p className="text-slate-600 mb-6">
                Most negative items must be removed from your credit report 7 years after the date of first delinquency.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date of First Delinquency</label>
                  <input
                    type="date"
                    value={firstDelinquencyDate}
                    onChange={(e) => setFirstDelinquencyDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This is when you first became 30+ days late on the account
                  </p>
                </div>

                <button
                  onClick={handleCalculateRemoval}
                  className="w-full py-3 bg-gradient-to-r from-lime-500 to-teal-600 text-white rounded-xl font-medium hover:from-lime-400 hover:to-teal-500 transition"
                >
                  Calculate Removal Date
                </button>
              </div>

              {removalDate && (
                <div className="mt-6 p-6 bg-teal-50 border border-teal-200 rounded-xl">
                  <h3 className="font-semibold text-teal-700 mb-2">Removal Date</h3>
                  <p className="text-3xl font-bold text-teal-600 mb-2">
                    {removalDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {removalDate < new Date() ? (
                    <p className="text-green-600 font-medium">
                      This item should already be removed! If it&apos;s still showing, dispute it.
                    </p>
                  ) : (
                    <p className="text-slate-600">
                      {Math.ceil((removalDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold mb-2">Important Notes</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Bankruptcies remain for 7-10 years depending on the chapter filed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Some states have shorter reporting periods for paid collections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>The date cannot be reset by paying the debt or the debt being sold</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>If an item is reported beyond 7 years, you can dispute it for immediate removal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthenticatedLayout>
  );
}
