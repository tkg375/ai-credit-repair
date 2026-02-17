"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

export default function ReferralsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const [referredCount, setReferredCount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;

    fetch("/api/referrals", {
      headers: { Authorization: `Bearer ${user.idToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.referral) {
          setReferralCode(data.referral.referralCode || "");
          setReferredCount((data.referral.referredUsers as string[])?.length || 0);
          setRewards(data.referral.rewards || 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : "";

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="referrals">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Refer & Earn
          </h1>
          <p className="text-slate-500 mt-2">Share Credit 800 with friends and both of you get rewarded.</p>
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-8">
          <h2 className="font-semibold text-lg mb-4">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold">1</div>
              <p className="text-sm">Share your unique referral code with friends</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold">2</div>
              <p className="text-sm">They sign up using your code</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold">3</div>
              <p className="text-sm">You both get 1 free month of Pro!</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{referredCount}</p>
            <p className="text-xs text-slate-500">Friends Referred</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{rewards}</p>
            <p className="text-xs text-slate-500">Free Months Earned</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">${(rewards * 19.99).toFixed(0)}</p>
            <p className="text-xs text-slate-500">Total Saved</p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold mb-4">Your Referral Code</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg font-bold text-center tracking-wider">
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode)}
              className="px-4 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <h3 className="font-semibold mb-3">Referral Link</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600"
            />
            <button
              onClick={() => handleCopy(referralLink)}
              className="px-4 py-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Share With Friends</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`sms:?body=I've been using Credit 800 to fix my credit score. Use my referral code ${referralCode} to get a free month of Pro! ${referralLink}`}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
            >
              Text Message
            </a>
            <a
              href={`mailto:?subject=Check out Credit 800&body=I've been using Credit 800 to fix my credit. Use my code ${referralCode} to get started: ${referralLink}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
            >
              Email
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=Fixing my credit with @Credit800! Use my code ${referralCode} to get a free month of Pro: ${referralLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  );
}
