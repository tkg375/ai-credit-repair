const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Credit 800 <noreply@credit-800.com>";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email:", subject);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[email] Resend error:", err);
  }
}

export async function sendAnalysisCompleteEmail(to: string, name: string, itemCount: number, bureau: string) {
  await sendEmail(
    to,
    `Your ${bureau} report analysis is ready — ${itemCount} items found`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Analysis Complete</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Your ${bureau} credit report has been analyzed</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>Your credit report analysis is ready. Here's what we found:</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:18px;font-weight:bold;color:#0f172a">${itemCount} negative item${itemCount !== 1 ? "s" : ""} identified</p>
        <p style="margin:4px 0 0;color:#64748b;font-size:14px">Each item includes specific removal strategies with success rates</p>
      </div>
      <p>Log in to review each item and generate your dispute letters.</p>
      <a href="https://credit-800.com/disputes" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">View My Disputes →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendDisputeMailedEmail(to: string, name: string, creditorName: string, expectedDelivery: string) {
  await sendEmail(
    to,
    `Your dispute letter to ${creditorName} has been mailed`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Letter Mailed ✓</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Your dispute letter is on its way</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>Your dispute letter to <strong>${creditorName}</strong> has been submitted to USPS and will be delivered by <strong>${expectedDelivery || "5–7 business days"}</strong>.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-weight:bold;color:#15803d">What happens next?</p>
        <ul style="margin:8px 0 0;color:#166534;font-size:14px;padding-left:20px">
          <li>The recipient has 30 days to respond under FCRA rules</li>
          <li>Track your mail status in the Disputes tab</li>
          <li>If no response after 30 days, use the Escalate button for Round 2</li>
        </ul>
      </div>
      <a href="https://credit-800.com/disputes" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">Track My Disputes →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    "Welcome to Credit 800 — let's fix your credit",
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Welcome to Credit 800</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Your path to an 800 credit score starts here</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>You're all set! Here's how to get started:</p>
      <ol style="color:#334155;line-height:1.8">
        <li><strong>Upload your credit report</strong> — PDF from Equifax, Experian, or TransUnion</li>
        <li><strong>Review AI analysis</strong> — we'll identify every disputable item</li>
        <li><strong>Generate dispute letters</strong> — FCRA-compliant, ready to send</li>
        <li><strong>Mail via USPS</strong> — directly from the app, certified mail</li>
      </ol>
      <a href="https://credit-800.com/upload" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">Upload My First Report →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}
