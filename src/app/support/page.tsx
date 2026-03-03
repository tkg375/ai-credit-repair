import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Support",
  description: "Contact Credit 800 support via phone or email.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-gradient-to-r from-lime-500 via-teal-500 to-cyan-600">
        <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
          <Link href="/">
            <Logo className="h-10 sm:h-14 w-auto" />
          </Link>
          <div className="flex gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 text-sm text-white/90 hover:text-white transition whitespace-nowrap"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-4 py-2 text-sm bg-white text-teal-600 hover:bg-lime-50 rounded-lg transition whitespace-nowrap font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">We&rsquo;re Here to Help</h1>
        <p className="text-slate-500 text-center mb-12 text-sm sm:text-base">
          Reach out any time and we&rsquo;ll get back to you as soon as possible.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <a
            href="tel:+12294578122"
            className="flex flex-col items-center gap-4 border border-slate-200 rounded-2xl p-8 hover:border-teal-400 hover:shadow-lg transition group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-lime-500 to-teal-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Phone</p>
              <p className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition">
                1-229-457-8122
              </p>
            </div>
          </a>

          <a
            href="mailto:support@credit-800.com"
            className="flex flex-col items-center gap-4 border border-slate-200 rounded-2xl p-8 hover:border-teal-400 hover:shadow-lg transition group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition">
                support@credit-800.com
              </p>
            </div>
          </a>
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          Typical response time: within 1 business day.
        </p>
      </div>
    </div>
  );
}
