import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const FROM_EMAIL = "Credit 800 <noreply@credit-800.com>";
const REPLY_TO = "support@credit-800.com";

function getSesClient() {
  const region = process.env.S3_REGION || "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new SESv2Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getSesClient();
  if (!client) {
    console.warn("[email] AWS credentials not set — skipping email:", subject);
    return;
  }

  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: FROM_EMAIL,
        ReplyToAddresses: [REPLY_TO],
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: { Html: { Data: html, Charset: "UTF-8" } },
          },
        },
      })
    );
  } catch (err) {
    console.error("[email] SES error:", err);
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

export async function sendProUpgradeEmail(to: string, amount: number) {
  const amountStr = `$${(amount / 100).toFixed(2)}`;
  await sendEmail(
    to,
    "You're now a Credit 800 Pro member 🎉",
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Welcome to Pro! 🎉</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Your Credit 800 Pro membership is now active</p>
      </div>
      <p>You're all set! Your Pro plan (${amountStr}/month) is active and all features are unlocked.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#15803d">What you now have access to:</p>
        <ul style="margin:0;color:#166534;font-size:14px;padding-left:20px;line-height:1.8">
          <li>Unlimited dispute letters (Rounds 1, 2 & 3)</li>
          <li>CFPB complaint generator</li>
          <li>Credit score simulator</li>
          <li>Document vault</li>
          <li>Debt payoff optimizer</li>
          <li>Priority AI analysis</li>
          <li>Score tracking &amp; charts</li>
          <li>Card recommendations</li>
        </ul>
      </div>
      <p style="color:#64748b;font-size:14px">A payment receipt has been sent to your email from Stripe. You can manage your subscription, update your payment method, or cancel anytime from the Subscription page.</p>
      <a href="https://credit-800.com/disputes" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">Start Disputing →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Questions? Reply to this email.<br>Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendNewSubscriberNotification(subscriberEmail: string, amount: number) {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) return;

  const amountStr = `$${(amount / 100).toFixed(2)}`;
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

  await sendEmail(
    ownerEmail,
    `💰 New subscriber — ${subscriberEmail} (${amountStr}/mo)`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">New Subscriber 🎉</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Someone just upgraded to Credit 800 Pro</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Email</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold">${subscriberEmail}</td></tr>
        <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Amount</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#16a34a">${amountStr}/month</td></tr>
        <tr><td style="padding:10px;color:#64748b;font-size:14px">Time</td><td style="padding:10px">${now} ET</td></tr>
      </table>
      <a href="https://dashboard.stripe.com/customers" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">View in Stripe →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Automated notification</p>
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

export async function sendCreditChangesEmail(
  to: string,
  name: string,
  changes: {
    newItems: { creditorName: string; accountType: string; balance: number; status: string }[];
    removedItems: { creditorName: string; accountType: string; balance: number }[];
    balanceChanges: { creditorName: string; oldBalance: number; newBalance: number; delta: number }[];
    statusChanges: { creditorName: string; oldStatus: string; newStatus: string }[];
    totalBalanceDelta: number;
  }
) {
  const improved = changes.removedItems.length > 0 || changes.totalBalanceDelta < -100;
  const newNegatives = changes.newItems.filter(i => i.status !== "CURRENT").length;
  const balanceDeltaStr = changes.totalBalanceDelta >= 0
    ? `+$${changes.totalBalanceDelta.toLocaleString()}`
    : `-$${Math.abs(changes.totalBalanceDelta).toLocaleString()}`;
  const balanceColor = changes.totalBalanceDelta <= 0 ? "#15803d" : "#b91c1c";

  const summaryRows = [
    changes.newItems.length > 0
      ? `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">New items</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#b91c1c">+${changes.newItems.length}</td></tr>`
      : "",
    changes.removedItems.length > 0
      ? `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Items removed</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#15803d">-${changes.removedItems.length}</td></tr>`
      : "",
    changes.balanceChanges.length > 0
      ? `<tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Balance changes</td><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold">${changes.balanceChanges.length} account${changes.balanceChanges.length !== 1 ? "s" : ""}</td></tr>`
      : "",
    `<tr><td style="padding:10px;color:#64748b;font-size:14px">Total balance change</td><td style="padding:10px;font-weight:bold;color:${balanceColor}">${balanceDeltaStr}</td></tr>`,
  ].filter(Boolean).join("");

  const headerBg = improved && newNegatives === 0
    ? "linear-gradient(135deg,#84cc16,#14b8a6)"
    : "linear-gradient(135deg,#f59e0b,#ef4444)";
  const headerTitle = improved && newNegatives === 0 ? "Credit Report Improved" : "Changes Detected on Your Report";
  const headerSub = improved && newNegatives === 0
    ? "Good news — your latest report shows positive changes"
    : `${newNegatives > 0 ? `${newNegatives} new negative item${newNegatives !== 1 ? "s" : ""} detected` : "Review the changes on your report"}`;

  await sendEmail(
    to,
    `Credit report changes detected — ${changes.newItems.length > 0 ? `${changes.newItems.length} new item${changes.newItems.length !== 1 ? "s" : ""}` : changes.removedItems.length > 0 ? `${changes.removedItems.length} item${changes.removedItems.length !== 1 ? "s" : ""} removed` : "balance update"}`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:${headerBg};padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">${headerTitle}</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">${headerSub}</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>We compared your latest credit report upload to your previous one. Here's what changed:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        ${summaryRows}
      </table>
      ${changes.newItems.length > 0 ? `
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#b91c1c">New Items (${changes.newItems.length})</p>
        <ul style="margin:0;padding-left:20px;color:#7f1d1d;font-size:14px;line-height:1.8">
          ${changes.newItems.map(i => `<li>${i.creditorName} — ${i.accountType} ($${i.balance.toLocaleString()})</li>`).join("")}
        </ul>
      </div>` : ""}
      ${changes.removedItems.length > 0 ? `
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#15803d">Items No Longer Showing (${changes.removedItems.length})</p>
        <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8">
          ${changes.removedItems.map(i => `<li>${i.creditorName} — ${i.accountType}</li>`).join("")}
        </ul>
      </div>` : ""}
      <a href="https://credit-800.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">View Full Report →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendEscalationReadyEmail(
  to: string,
  name: string,
  creditorName: string,
  bureau: string,
  round: number
) {
  await sendEmail(
    to,
    `Time to escalate your dispute with ${creditorName} — Round ${round} available`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#a855f7,#7c3aed);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Round ${round} Escalation Ready</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">30 days have passed — it's time to apply more pressure</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>Your Round 1 dispute letter to <strong>${creditorName}</strong> (${bureau}) was sent over 30 days ago with no satisfactory response.</p>
      <div style="background:#faf5ff;border:1px solid #d8b4fe;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#7c3aed">What Round ${round} does:</p>
        <ul style="margin:0;color:#581c87;font-size:14px;padding-left:20px;line-height:1.8">
          ${round === 2 ? `<li>Demands the exact <em>method of verification</em> used — something bureaus often can't provide</li>
          <li>Cites FCRA § 611(a)(7) — failure to provide this is a violation</li>
          <li>Increases pressure significantly, often leading to deletion</li>` : `<li>Escalates to a formal FCRA willful non-compliance notice</li>
          <li>References prior disputes and lack of proper verification</li>
          <li>Puts the bureau on notice of potential legal action</li>`}
        </ul>
      </div>
      <p>Log in to generate your Round ${round} letter and send it now.</p>
      <a href="https://credit-800.com/disputes" style="display:inline-block;background:linear-gradient(135deg,#a855f7,#7c3aed);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">Escalate Now →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendHealthReportEmail(
  to: string,
  name: string,
  stats: {
    latestScore: number | null;
    scoreChange: number | null;
    sentCount: number;
    resolvedCount: number;
    disputableCount: number;
  }
) {
  const scoreDisplay = stats.latestScore ? String(stats.latestScore) : "—";
  const changeDisplay = stats.scoreChange !== null
    ? (stats.scoreChange >= 0 ? `+${stats.scoreChange}` : String(stats.scoreChange))
    : "—";
  const changeColor = stats.scoreChange !== null && stats.scoreChange > 0 ? "#15803d" : stats.scoreChange !== null && stats.scoreChange < 0 ? "#b91c1c" : "#64748b";

  await sendEmail(
    to,
    `Your monthly Credit 800 health report — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Monthly Credit Health Report</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>
      <p>Hi ${name || "there"}, here's a summary of your credit repair progress this month:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Latest Credit Score</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold;font-size:18px">${scoreDisplay}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Score Change (30 days)</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:${changeColor}">${changeDisplay} pts</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Active Disputes</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold">${stats.sentCount}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Disputes Resolved</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#15803d">${stats.resolvedCount}</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;color:#64748b;font-size:14px">Items Still to Dispute</td>
          <td style="padding:12px 16px;font-weight:bold;color:#d97706">${stats.disputableCount}</td>
        </tr>
      </table>
      ${stats.disputableCount > 0 ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#92400e">You still have <strong>${stats.disputableCount} disputable item${stats.disputableCount !== 1 ? "s" : ""}</strong> on your report. Each one removed can boost your score by 10-80 points.</p>
      </div>` : `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:14px;color:#166534">Great work — all identified items have been disputed. Keep uploading new reports to catch any new items.</p>
      </div>`}
      <a href="https://credit-800.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">View My Dashboard →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Not a credit repair organization. Educational tool only.<br>You're receiving this because you have an active Credit 800 account.</p>
    </body></html>`
  );
}

export async function sendOTPEmail(to: string, name: string, code: string) {
  await sendEmail(
    to,
    `Your Credit 800 verification code: ${code}`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Two-Factor Verification</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Your Credit 800 sign-in code</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>Use the code below to complete your sign-in. This code expires in <strong>10 minutes</strong>.</p>
      <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0;text-align:center">
        <p style="margin:0;font-size:40px;font-weight:bold;letter-spacing:12px;font-family:monospace;color:#0f172a">${code}</p>
      </div>
      <p style="color:#64748b;font-size:14px">If you didn't request this code, you can safely ignore this email. Someone may have typed your email by mistake.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · This code is valid for 10 minutes only.</p>
    </body></html>`
  );
}

export async function sendWeeklyProgressEmail(
  to: string,
  name: string,
  stats: {
    scoresThisWeek: number;
    latestScore: number | null;
    disputesSentThisWeek: number;
    goalsCompletedThisWeek: number;
    upcomingDeadlines: { creditorName: string; daysLeft: number }[];
  }
) {
  const scoreDisplay = stats.latestScore ? String(stats.latestScore) : "—";

  const deadlinesHtml = stats.upcomingDeadlines.length > 0
    ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:bold;color:#92400e">Upcoming Response Deadlines</p>
        <ul style="margin:0;padding-left:20px;color:#78350f;font-size:14px;line-height:1.8">
          ${stats.upcomingDeadlines.map(d => `<li>${d.creditorName} — ${d.daysLeft} day${d.daysLeft !== 1 ? "s" : ""} left</li>`).join("")}
        </ul>
      </div>`
    : "";

  await sendEmail(
    to,
    `Your weekly Credit 800 progress — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#84cc16,#14b8a6);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:24px">Weekly Progress Update</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Here's what happened with your credit this week</p>
      </div>
      <p>Hi ${name || "there"},</p>
      <p>Here's your weekly summary from Credit 800:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Latest Credit Score</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold;font-size:18px">${scoreDisplay}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Scores Logged This Week</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold">${stats.scoresThisWeek}</td>
        </tr>
        <tr style="background:#f8fafc">
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px">Disputes Sent This Week</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:${stats.disputesSentThisWeek > 0 ? "#0f172a" : "#94a3b8"}">${stats.disputesSentThisWeek}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#64748b;font-size:14px">Goals Completed This Week</td>
          <td style="padding:12px 16px;font-weight:bold;color:${stats.goalsCompletedThisWeek > 0 ? "#15803d" : "#94a3b8"}">${stats.goalsCompletedThisWeek}</td>
        </tr>
      </table>
      ${deadlinesHtml}
      <a href="https://credit-800.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#84cc16,#14b8a6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0">View My Dashboard →</a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 · Weekly progress digest. Not a credit repair organization. Educational tool only.</p>
    </body></html>`
  );
}

export async function sendIssueReport(params: {
  userId: string;
  userEmail: string;
  issue: string;
  page?: string;
}): Promise<void> {
  const { userId, userEmail, issue, page } = params;

  const client = getSesClient();
  if (!client) throw new Error("Email service not configured (missing AWS credentials)");

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      ReplyToAddresses: [REPLY_TO],
      Destination: { ToAddresses: [REPLY_TO] },
      Content: {
        Simple: {
          Subject: { Data: `[Issue Report] from ${userEmail}`, Charset: "UTF-8" },
          Body: {
            Html: {
              Data: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1e293b">
      <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:24px;border-radius:12px;margin-bottom:24px">
        <h1 style="color:white;margin:0;font-size:22px">Issue Report</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">A user has reported a problem</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:bold;width:130px">User ID</td><td style="padding:10px;border:1px solid #e2e8f0;font-family:monospace;font-size:13px">${userId}</td></tr>
        <tr><td style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:bold">Email</td><td style="padding:10px;border:1px solid #e2e8f0">${userEmail}</td></tr>
        ${page ? `<tr><td style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:bold">Page</td><td style="padding:10px;border:1px solid #e2e8f0">${page}</td></tr>` : ""}
        <tr><td style="padding:10px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:bold">Submitted</td><td style="padding:10px;border:1px solid #e2e8f0">${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</td></tr>
      </table>
      <div style="background:#fef9f0;border:1px solid #f59e0b;border-radius:8px;padding:16px">
        <p style="margin:0 0 8px;font-weight:bold;color:#92400e">Issue Description</p>
        <p style="margin:0;white-space:pre-wrap;color:#1e293b">${issue.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">Credit 800 Issue Tracker · Reply to this email to respond to the user.</p>
    </body></html>`,
              Charset: "UTF-8",
            },
          },
        },
      },
    })
  );
}

