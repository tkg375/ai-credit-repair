"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "@/components/NotificationBell";

type NavItem = "dashboard" | "upload" | "tools" | "disputes" | "plan" | "scores" | "simulator" | "education" | "vault" | "payoff" | "recommendations" | "cfpb" | "referrals" | "pricing" | "utilization" | "bureaus";

const mainNavItems: { href: string; label: string; key: NavItem }[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/disputes", label: "Disputes", key: "disputes" },
  { href: "/scores", label: "Scores", key: "scores" },
  { href: "/simulator", label: "Simulator", key: "simulator" },
  { href: "/tools", label: "Tools", key: "tools" },
];

const moreNavItems: { href: string; label: string; key: NavItem }[] = [
  { href: "/upload", label: "Upload Report", key: "upload" },
  { href: "/plan", label: "Action Plan", key: "plan" },
  { href: "/education", label: "Education", key: "education" },
  { href: "/vault", label: "Document Vault", key: "vault" },
  { href: "/payoff", label: "Debt Payoff", key: "payoff" },
  { href: "/recommendations", label: "Card Picks", key: "recommendations" },
  { href: "/utilization", label: "Utilization Optimizer", key: "utilization" },
  { href: "/bureaus", label: "Bureau Comparison", key: "bureaus" },
  { href: "/cfpb", label: "CFPB Complaint", key: "cfpb" },
  { href: "/referrals", label: "Referrals", key: "referrals" },
  { href: "/pricing", label: "Upgrade", key: "pricing" },
];

export function AuthenticatedLayout({
  activeNav,
  children,
}: {
  activeNav: NavItem;
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white text-slate-900">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto border-b border-slate-200">
        <Link href="/dashboard">
          <Logo className="h-7 sm:h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 text-sm items-center">
          {mainNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                activeNav === item.key
                  ? "text-teal-600 font-medium"
                  : "text-slate-600 hover:text-teal-600 transition"
              }
            >
              {item.label}
            </Link>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`text-slate-600 hover:text-teal-600 transition flex items-center gap-1 ${
                moreNavItems.some((i) => i.key === activeNav) ? "text-teal-600 font-medium" : ""
              }`}
            >
              More
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  {moreNavItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`block px-4 py-2 text-sm hover:bg-slate-50 ${
                        activeNav === item.key ? "text-teal-600 font-medium" : "text-slate-600"
                      }`}
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <NotificationBell />

          <button
            onClick={signOut}
            className="text-slate-400 hover:text-red-500 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            {[...mainNavItems, ...moreNavItems].map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`block ${
                  activeNav === item.key
                    ? "text-teal-600 font-medium"
                    : "text-slate-600 hover:text-teal-600 transition"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="block text-slate-400 hover:text-red-500 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
