import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MarketingNav } from "@/components/MarketingNav";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <MarketingNav />
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-slate-500 mb-8">Last updated: March 9, 2026</p>

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
            <p className="text-slate-600 leading-relaxed mb-3">
              Credit 800 is an AI-powered financial platform offering two tiers:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-3">
              <li>
                <strong>Self Service (Free):</strong> A DIY credit repair toolkit including AI-powered credit report analysis,
                FCRA-compliant dispute letter generation, credit score tracking, debt payoff planning, budget management,
                credit score simulator, CFPB complaint generator, document vault, identity monitoring, credit builder
                product recommendations, and optional physical USPS mailing of dispute letters ($2/letter).
              </li>
              <li>
                <strong>Autopilot ($49/month):</strong> A fully automated credit repair service that, with your written
                FCRA authorization, pulls your credit report monthly via a soft inquiry, auto-generates dispute letters
                for eligible items, and automatically mails them via USPS (up to 10 letters/month included). Includes
                everything in Self Service plus hands-free VantageScore tracking, a compliance audit trail, and priority support.
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Self Service is free and available to all registered users. Autopilot is a paid upgrade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Self Service Plan — Educational Use</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The Self Service plan provides educational tools and letter templates. Under this plan, Credit 800:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Does not guarantee removal of any items from your credit report</li>
              <li>Does not promise to improve your credit score by any specific amount</li>
              <li>Does not submit disputes on your behalf or act as your agent</li>
              <li>Does not provide legal advice</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              You are solely responsible for reviewing, editing, and submitting any dispute letters generated under the Self Service plan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Autopilot Plan — Automated Credit Repair</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The Autopilot plan is a fully automated service. By activating Autopilot, you grant Credit 800 written
              authorization under FCRA § 604(a)(2) to access your credit file via a soft inquiry for the purpose of
              dispute identification and letter generation. Specifically, you agree that:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mb-3">
              <li>Credit 800 may pull your credit report no more than once every 30 days using a soft inquiry that does not affect your credit score</li>
              <li>Credit 800 may generate and mail FCRA § 611-compliant dispute letters to credit bureaus on your behalf as your authorized agent</li>
              <li>Physical mailing costs for up to 10 letters per month are included; your Stripe payment method on file may be charged $2 per additional letter</li>
              <li>You may revoke this authorization at any time via the Autopilot dashboard, which will stop future automated runs</li>
              <li>An immutable audit trail of all actions taken on your behalf is maintained and available to you</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Credit 800 does not guarantee any specific improvement to your credit score. Results depend on the accuracy of
              information on your credit report, the responsiveness of bureaus and creditors, and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscription and Billing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Self Service is free for all registered users. Autopilot is a paid plan at $49/month.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Autopilot subscriptions automatically renew each month unless cancelled</li>
              <li>You may cancel Autopilot at any time; access continues through the end of the current billing period</li>
              <li>No refunds are issued for partial Autopilot billing periods</li>
              <li>USPS physical mailing of dispute letters incurs an additional $2 per letter charged at time of mailing</li>
              <li>Autopilot includes up to 10 mailed letters per month; additional letters are $2 each, charged to your payment method on file</li>
              <li>Payments are processed securely by Stripe. Credit 800 does not store your payment card information</li>
              <li>We reserve the right to change Autopilot pricing with 30 days&apos; notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Account Security and Two-Factor Authentication</h2>
            <p className="text-slate-600 leading-relaxed">
              Two-factor authentication (2FA) via email is mandatory for all accounts and cannot be disabled.
              A one-time verification code is sent to your registered email address each time you log in.
              You are responsible for maintaining the security of your email account. Codes are valid for a
              limited time, hashed with SHA-256 before storage, and automatically invalidated after use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. User Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Provide accurate information when creating your account and using the Service</li>
              <li>Only upload credit reports that belong to you</li>
              <li>Review all AI-generated content before use (Self Service plan)</li>
              <li>Not rely solely on the Service for credit-related decisions</li>
              <li>Comply with all applicable laws when submitting disputes</li>
              <li>Not use the Service to file false or fraudulent disputes</li>
              <li>Maintain a valid payment method on file if subscribed to Autopilot</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. AI-Generated Content Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service uses artificial intelligence to analyze credit reports and generate dispute letters.
              AI-generated content may contain errors or inaccuracies and may not be appropriate for your specific
              situation. Under the Self Service plan, you should always review, verify, and customize any
              AI-generated content before use. Under the Autopilot plan, letters are generated automatically;
              you may review your audit trail at any time. Credit 800 is not responsible for any consequences
              resulting from the use of AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Credit Builder Product Recommendations</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service may display curated secured credit cards, credit-builder loans, and similar financial
              products. Credit 800 may receive referral compensation if you apply for or open an account with a
              featured provider. Product listings are provided for informational purposes only and do not constitute
              financial advice. Always review the full terms of any financial product before applying. Credit 800 is
              not responsible for the terms, availability, or accuracy of third-party product offerings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Privacy and Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              Your use of the Service is also governed by our <Link href="/privacy" className="text-teal-600 hover:text-teal-500">Privacy Policy</Link>.
              We take reasonable measures to protect your personal information, but no method of transmission
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CREDIT 800 SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Modifications to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of
              any material changes by email or by posting the updated terms on the Service. Your continued
              use of the Service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of the United States. Any disputes arising from these
              Terms or your use of the Service shall be resolved through binding arbitration, except where
              prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact Information</h2>
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
