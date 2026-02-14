import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PrivacyPolicy() {
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
          <Link href="/register" className="px-3 sm:px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: February 6, 2025</p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Credit 800 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">Personal Information</h3>
            <p className="text-slate-600 leading-relaxed mb-3">When you create an account, we collect:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Email address</li>
              <li>Password (encrypted)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Credit Report Data</h3>
            <p className="text-slate-600 leading-relaxed mb-3">When you upload a credit report, we process:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Account information (creditor names, account numbers, balances)</li>
              <li>Payment history</li>
              <li>Public records</li>
              <li>Inquiries</li>
              <li>Personal identifying information contained in the report</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Usage Data</h3>
            <p className="text-slate-600 leading-relaxed mb-3">We automatically collect:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Pages visited and features used</li>
              <li>Date and time of access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Provide and maintain the Service</li>
              <li>Analyze your credit report and identify potential disputes</li>
              <li>Generate personalized dispute letters and action plans</li>
              <li>Communicate with you about the Service</li>
              <li>Improve and optimize the Service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. AI Processing</h2>
            <p className="text-slate-600 leading-relaxed">
              We use artificial intelligence services to analyze your credit report data. This processing
              occurs on secure servers. The AI analysis helps identify disputable items and generate
              customized dispute letters. We do not use your credit report data to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Storage and Security</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Your data is stored using industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Credit reports are stored in encrypted cloud storage</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>All data transmission uses TLS encryption</li>
              <li>Access to data is restricted to authorized personnel only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your account information and credit report data for as long as your account is active.
              You can delete your account and all associated data at any time through the Service.
              After account deletion, we may retain certain information as required by law or for legitimate
              business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Information Sharing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third-party companies that help us operate the Service (cloud hosting, AI processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking</h2>
            <p className="text-slate-600 leading-relaxed">
              We use essential cookies to maintain your session and preferences. We do not use
              third-party advertising cookies. You can configure your browser to reject cookies,
              but this may affect the functionality of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service is not intended for users under 18 years of age. We do not knowingly collect
              personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. California Privacy Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer
              Privacy Act (CCPA), including the right to know what personal information we collect,
              the right to delete your information, and the right to opt out of the sale of personal
              information (which we do not do).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through the Service.
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
