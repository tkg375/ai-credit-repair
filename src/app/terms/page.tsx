import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto border-b border-slate-200">
        <Link href="/">
          <Logo className="h-10 sm:h-14 w-auto" />
        </Link>
        <div className="flex gap-2 sm:gap-4">
          <Link href="/login" className="px-3 sm:px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition whitespace-nowrap">
            Log In
          </Link>
          <Link href="/register" className="px-3 sm:px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: February 27, 2026</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using Credit 800 (&quot;the Service&quot;), operated by Credit 800 LLC, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Credit 800 is an AI-powered educational platform that helps users understand their credit reports,
              identify potentially disputable items, generate FCRA-compliant dispute letter templates, track disputes,
              and learn credit-building strategies. Additional features include credit score tracking, debt payoff planning,
              budget management, identity monitoring, credit builder product recommendations, weekly progress summaries,
              two-factor authentication, and optional physical mail delivery of dispute letters via USPS through a
              third-party mailing partner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Not a Credit Repair Organization</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong>Credit 800 is NOT a credit repair organization as defined by the Credit Repair Organizations Act (CROA).</strong> We do not:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Guarantee removal of any items from your credit report</li>
              <li>Promise to improve your credit score by any specific amount</li>
              <li>Submit disputes on your behalf or act as your agent</li>
              <li>Provide legal advice</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              The Service provides educational information and letter templates. You are solely responsible for
              reviewing, editing, and submitting any dispute letters. Any results are not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Subscription and Billing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Credit 800 offers a free tier and a Pro subscription plan billed monthly at $19.99/month.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Subscriptions automatically renew each month unless cancelled</li>
              <li>You may cancel at any time; access continues through the end of the current billing period</li>
              <li>No refunds are issued for partial billing periods</li>
              <li>Payments are processed securely by Stripe. Credit 800 does not store your payment card information</li>
              <li>We reserve the right to change subscription pricing with 30 days&apos; notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Provide accurate information when using the Service</li>
              <li>Only upload credit reports that belong to you</li>
              <li>Review all AI-generated content before use</li>
              <li>Not rely solely on the Service for credit-related decisions</li>
              <li>Comply with all applicable laws when submitting disputes</li>
              <li>Not use the Service to file false or fraudulent disputes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. AI-Generated Content Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service uses artificial intelligence to analyze credit reports and generate dispute letters.
              AI-generated content may contain errors or inaccuracies and may not be appropriate for your specific
              situation. You should always review, verify, and customize any AI-generated content before use.
              Credit 800 is not responsible for any consequences resulting from the use of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. No Guarantee of Results</h2>
            <p className="text-slate-600 leading-relaxed">
              We make no guarantees regarding the outcome of any disputes you may file. Success in credit
              disputes depends on many factors outside our control, including the accuracy of information
              on your credit report, the responsiveness of credit bureaus and creditors, and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Credit Builder Product Recommendations</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service may display curated secured credit cards, credit-builder loans, and similar financial
              products. Credit 800 may receive referral compensation if you apply for or open an account with a
              featured provider. Product listings are provided for informational purposes only and do not constitute
              financial advice. Always review the full terms of any financial product before applying. Credit 800 is
              not responsible for the terms, availability, or accuracy of third-party product offerings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Privacy and Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              Your use of the Service is also governed by our <Link href="/privacy" className="text-teal-600 hover:text-teal-500">Privacy Policy</Link>.
              We take reasonable measures to protect your personal information, but no method of transmission
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CREDIT 800 SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Modifications to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of
              any material changes by email or by posting the updated terms on the Service. Your continued
              use of the Service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of the United States. Any disputes arising from these
              Terms or your use of the Service shall be resolved through binding arbitration, except where
              prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:support@credit-800.com" className="text-teal-600 hover:text-teal-500">support@credit-800.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <Logo className="h-6 w-auto" />
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-700 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-700 transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
