"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

interface Breach {
  name: string;
  title: string;
  breachDate: string;
  dataClasses: string[];
  description: string;
}

interface BreachResult {
  available: boolean;
  email?: string;
  breachCount?: number;
  breaches?: Breach[];
  checkedAt?: string;
  message?: string;
}

const DATA_CLASS_COLORS: Record<string, string> = {
  "Passwords": "bg-red-100 text-red-700",
  "Email addresses": "bg-orange-100 text-orange-700",
  "Usernames": "bg-yellow-100 text-yellow-700",
  "Names": "bg-amber-100 text-amber-700",
  "Phone numbers": "bg-pink-100 text-pink-700",
  "Physical addresses": "bg-purple-100 text-purple-700",
  "Credit cards": "bg-red-200 text-red-800",
  "Social security numbers": "bg-red-300 text-red-900",
  "Bank account numbers": "bg-red-200 text-red-800",
};

function getDataClassColor(cls: string): string {
  return DATA_CLASS_COLORS[cls] || "bg-slate-100 text-slate-600";
}

export default function MonitoringPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<BreachResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    fetch("/api/monitoring/breaches", {
      headers: { Authorization: `Bearer ${user.idToken}` },
    })
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setError("Failed to check breach data."))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthenticatedLayout activeNav="monitoring">
      <div className="relative">
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Later This Year</h2>
            <p className="text-slate-500 text-sm max-w-xs">Identity Monitoring is under active development and will be available soon.</p>
          </div>
        </div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Identity Monitoring</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Check if your email has appeared in known data breaches.
          </p>
        </div>

        {/* Email being monitored */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email being monitored</p>
            <p className="font-medium text-slate-800">{user?.email}</p>
          </div>
          {result?.checkedAt && (
            <p className="ml-auto text-xs text-slate-400 hidden sm:block">
              Checked {new Date(result.checkedAt).toLocaleString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">{error}</div>
        )}

        {result && !result.available && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Monitoring Setup Pending</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">{result.message || "Identity monitoring is not yet configured for this account. Check back soon."}</p>
          </div>
        )}

        {result?.available && result.breachCount === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">No Breaches Found</h3>
            <p className="text-emerald-700 text-sm">Your email hasn&apos;t appeared in any known data breaches. Stay vigilant!</p>
          </div>
        )}

        {result?.available && result.breachCount && result.breachCount > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800">
                  {result.breachCount} breach{result.breachCount !== 1 ? "es" : ""} found
                </p>
                <p className="text-sm text-red-700">Your email appeared in {result.breachCount} known data breach{result.breachCount !== 1 ? "es" : ""}.</p>
              </div>
            </div>

            <div className="space-y-4">
              {result.breaches?.map((breach) => (
                <div key={breach.name} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-base">{breach.title}</h3>
                      <p className="text-sm text-slate-500">
                        Breach date: {new Date(breach.breachDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {breach.dataClasses.map((cls) => (
                      <span key={cls} className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDataClassColor(cls)}`}>
                        {cls}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3" dangerouslySetInnerHTML={{ __html: breach.description }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommended Actions
          </h2>
          <div className="space-y-3">
            {[
              { icon: "🔑", title: "Change Your Passwords", desc: "Use a unique, strong password for each account. Consider a password manager." },
              { icon: "📱", title: "Enable Two-Factor Authentication", desc: "Add 2FA to all sensitive accounts — email, banking, and social media." },
              { icon: "❄️", title: "Freeze Your Credit", desc: "A credit freeze prevents new accounts from being opened in your name.", link: "/freeze" },
              { icon: "👀", title: "Monitor Your Credit", desc: "Check your credit reports regularly for unauthorized accounts.", link: "/upload" },
            ].map((action) => (
              <div key={action.title} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-xl shrink-0">{action.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{action.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                  {action.link && (
                    <a href={action.link} className="text-xs text-teal-600 hover:underline mt-1 inline-block">
                      Take action →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Breach data provided by <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Have I Been Pwned</a>.
          Credit 800 checks for breaches but cannot remove your data from compromised services.
        </p>
      </main>
      </div>
    </AuthenticatedLayout>
  );
}
