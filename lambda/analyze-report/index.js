'use strict';

/**
 * AWS Lambda: analyze-report
 * Runs Gemini/Claude PDF analysis and generates the action plan.
 * Invoked asynchronously (Event type) from the Next.js /api/reports/analyze route.
 *
 * Event payload: { reportId, userId, s3Key, bureau }
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   GEMINI_API_KEY
 *   ANTHROPIC_API_KEY (optional fallback)
 *   AWS_S3_BUCKET
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const admin = require('firebase-admin');

// ── Firebase init ─────────────────────────────────────────────────────────────
if (!admin.apps.length) {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}
const db = admin.firestore();

// ── S3 client (credentials come from Lambda execution role) ───────────────────
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// ── Gemini analysis ───────────────────────────────────────────────────────────
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const GEMINI_PROMPT = `You are a credit report analyzer. Your task is to extract ALL negative/derogatory items from this credit report with 100% accuracy.

STEP 1: Identify the credit bureau (Equifax, Experian, or TransUnion) from the report header/branding.
STEP 2: Find the credit score if displayed in the report.
STEP 3: Extract EVERY account that has ANY of these negative indicators:
- Status contains: Collection, Charge-off, Charged off, Past due, Delinquent, Late, Written off, Sold, Transferred, Closed negative, Settled, Repossession, Foreclosure, Bankruptcy, Judgment, Tax lien
- Payment status shows any late payments (30, 60, 90, 120+ days)
- Account is marked as derogatory or adverse
- Balance owed on collection accounts
- Any account with negative remarks

STEP 4: For EACH negative account found, extract:
- creditorName: The company name
- accountNumber: Full or partial account number shown
- accountType: Collection, Credit Card, Auto Loan, Mortgage, Student Loan, Medical, Personal Loan, Utility, etc.
- balance: Current balance owed (number only, no $ or commas)
- status: The account status (COLLECTION, CHARGE_OFF, LATE, DELINQUENT, etc.)
- dateOpened: Date opened or date of first delinquency (YYYY-MM-DD format)
- disputeReason: Why this item may be disputable

IMPORTANT RULES:
- Do NOT skip any negative items - be thorough
- Include ALL collections, even medical or small amounts
- Use exact creditor names as shown in the report
- If a field is not found, use null
- Balance should be a number (0 if unknown)

Return a JSON object with this EXACT structure:
{
  "bureau": "Equifax",
  "score": 650,
  "items": [
    {
      "creditorName": "Example Collections",
      "accountNumber": "****1234",
      "accountType": "Collection",
      "balance": 1500,
      "status": "COLLECTION",
      "dateOpened": "2020-01-15",
      "disputeReason": "Debt validation required - verify debt ownership"
    }
  ]
}

Return ONLY the JSON object. No explanations, no markdown code blocks, just the raw JSON.`;

async function analyzeWithGemini(pdfBase64, apiKey, bureau) {
  const MAX_RETRIES = 4;
  const BASE_DELAY = 2000;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1) + Math.random() * 1000, 60000);
      console.log(`Gemini retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
            { text: GEMINI_PROMPT },
          ],
        }],
        generationConfig: { temperature: 0, topP: 1, topK: 1, maxOutputTokens: 65536 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if ([429, 500, 502, 503].includes(res.status) && attempt < MAX_RETRIES) {
        lastError = new Error(`Gemini ${res.status}: ${JSON.stringify(err)}`);
        continue;
      }
      throw new Error(`Gemini API error ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');

    return parseAnalysisJson(text, bureau);
  }

  throw lastError || new Error('Gemini failed after all retries');
}

// ── Claude analysis ───────────────────────────────────────────────────────────
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

const CLAUDE_PROMPT = `You are an expert credit report analyst. Analyze this credit report PDF and extract ALL account information.

For EACH account/tradeline found, extract all fields. Determine if disputable and what removal strategies apply.

Return valid JSON in this exact format:
{
  "items": [
    {
      "creditorName": "Company Name",
      "originalCreditor": null,
      "accountNumber": "****1234",
      "accountType": "Collection",
      "balance": 1500,
      "originalBalance": null,
      "creditLimit": null,
      "status": "COLLECTION",
      "dateOpened": "2020-01-15",
      "dateOfFirstDelinquency": null,
      "lastActivityDate": null,
      "latePayments": [],
      "isDisputable": true,
      "disputeReason": "Collection account - request debt validation",
      "removalStrategies": [
        { "method": "Debt Validation", "description": "Request proof of debt ownership", "priority": "HIGH", "successRate": "70%" }
      ],
      "bureau": "EQUIFAX"
    }
  ],
  "creditScore": 650,
  "summary": { "totalAccounts": 5, "negativeItems": 3, "collections": 2, "latePayments": 1, "totalDebt": 5000, "potentialRemovalAmount": 3000 }
}

Return ONLY the JSON, no other text.`;

async function analyzeWithClaude(pdfBase64, apiKey, bureau) {
  const MAX_RETRIES = 4;
  const BASE_DELAY = 2000;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1) + Math.random() * 1000, 60000);
      console.log(`Claude retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }

    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2024-01-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: CLAUDE_PROMPT },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if ([429, 500, 502, 503, 529].includes(res.status) && attempt < MAX_RETRIES) {
        lastError = new Error(`Claude ${res.status}: ${JSON.stringify(err)}`);
        continue;
      }
      throw new Error(`Claude API error ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('No response from Claude');

    const result = parseAnalysisJson(text, bureau);
    result.items = result.items.map(item => ({ ...item, bureau: item.bureau || bureau }));
    return result;
  }

  throw lastError || new Error('Claude failed after all retries');
}

// ── JSON parsing ──────────────────────────────────────────────────────────────
function parseAnalysisJson(text, fallbackBureau) {
  let jsonStr = text;
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) jsonStr = mdMatch[1];
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) jsonStr = objMatch[0];

  const parsed = JSON.parse(jsonStr.trim());

  const detectedBureau = parsed.bureau || fallbackBureau;
  const bureau = detectedBureau.toLowerCase().includes('equifax') ? 'Equifax'
    : detectedBureau.toLowerCase().includes('experian') ? 'Experian'
    : detectedBureau.toLowerCase().includes('transunion') ? 'TransUnion'
    : detectedBureau;

  const items = (parsed.items || []).map(item => {
    const status = String(item.status || 'UNKNOWN').toUpperCase();
    const balance = Number(item.balance) || 0;
    const accountType = String(item.accountType || 'Unknown');
    return {
      creditorName: item.creditorName || 'Unknown',
      originalCreditor: item.originalCreditor || null,
      accountNumber: item.accountNumber || '****',
      accountType,
      balance,
      originalBalance: item.originalBalance != null ? Number(item.originalBalance) : null,
      creditLimit: item.creditLimit != null ? Number(item.creditLimit) : null,
      status,
      dateOpened: item.dateOpened || null,
      dateOfFirstDelinquency: item.dateOfFirstDelinquency || null,
      lastActivityDate: item.lastActivityDate || null,
      latePayments: item.latePayments || [],
      isDisputable: item.isDisputable !== undefined ? Boolean(item.isDisputable) : true,
      disputeReason: item.disputeReason || 'Request validation of debt',
      removalStrategies: item.removalStrategies || generateRemovalStrategies(status, accountType, balance),
      bureau: item.bureau || bureau,
    };
  });

  return {
    items,
    creditScore: parsed.score || parsed.creditScore || null,
    summary: parsed.summary || {
      totalAccounts: items.length,
      negativeItems: items.length,
      collections: items.filter(i => i.status.includes('COLLECTION') || i.accountType.toLowerCase().includes('collection')).length,
      latePayments: items.filter(i => i.status.includes('LATE') || (i.latePayments && i.latePayments.length > 0)).length,
      totalDebt: items.reduce((s, i) => s + i.balance, 0),
      potentialRemovalAmount: items.reduce((s, i) => s + i.balance, 0),
    },
  };
}

function generateRemovalStrategies(status, accountType, balance) {
  const strategies = [];
  const isCollection = status.includes('COLLECTION') || accountType.toLowerCase().includes('collection');
  const isChargeOff = status.includes('CHARGE') || status.includes('WRITTEN');
  const isMedical = accountType.toLowerCase().includes('medical');
  const isLate = status.includes('LATE') || status.includes('DELINQUENT') || status.includes('PAST');

  if (isCollection) {
    strategies.push({ method: 'Debt Validation Letter (FDCPA Section 809)', description: 'Send within 30 days. Demand original creditor name, account number, amount breakdown, and proof collector owns the debt.', priority: 'HIGH', successRate: '65-75%' });
  }
  if (isCollection || isChargeOff) {
    strategies.push({ method: 'Pay for Delete Negotiation', description: `Offer to pay ${balance < 500 ? 'full amount' : '30-50% of balance'} in exchange for complete removal. Always get the agreement in writing first.`, priority: balance < 1000 ? 'HIGH' : 'MEDIUM', successRate: '40-60%' });
  }
  if (isMedical) {
    strategies.push({ method: 'HIPAA Privacy Violation Dispute', description: 'Demand proof of HIPAA-compliant authorization. Many medical collections violate HIPAA.', priority: 'HIGH', successRate: '50-70%' });
  }
  strategies.push({ method: 'Credit Bureau Dispute (FCRA Section 611)', description: 'File disputes with Equifax, Experian, and TransUnion citing specific inaccuracies. Bureau has 30 days to investigate or must delete.', priority: 'HIGH', successRate: '30-40%' });
  if (isLate) {
    strategies.push({ method: 'Goodwill Adjustment Letter', description: "Write to original creditor's executive office requesting removal as a goodwill gesture.", priority: 'MEDIUM', successRate: '15-25%' });
  }
  strategies.push({ method: '7-Year Reporting Limit (FCRA Section 605)', description: 'Verify reported date is accurate. If date has been re-aged, dispute as FCRA violation.', priority: 'MEDIUM', successRate: '35-45%' });

  return strategies;
}

// ── Plan generation ───────────────────────────────────────────────────────────
async function generateActionPlan(userId, reportId) {
  const itemsSnap = await db.collection('reportItems')
    .where('userId', '==', userId)
    .get();
  const items = itemsSnap.docs.map(d => d.data());

  const collections = items.filter(i => String(i.status).includes('COLLECTION') || String(i.accountType).toLowerCase().includes('collection'));
  const chargeOffs = items.filter(i => String(i.status).includes('CHARGE') || String(i.status).includes('WRITTEN'));
  const latePayments = items.filter(i => String(i.status).includes('LATE') || String(i.status).includes('DELINQUENT') || (Array.isArray(i.latePayments) && i.latePayments.length > 0));
  const medicalCollections = collections.filter(i => String(i.accountType).toLowerCase().includes('medical'));
  const highUtilization = items.filter(i => {
    const bal = Number(i.balance) || 0, lim = Number(i.creditLimit) || 0;
    return lim > 0 && bal / lim > 0.3;
  });
  const collectionDebt = collections.reduce((s, i) => s + (Number(i.balance) || 0), 0);

  const scoresSnap = await db.collection('creditScores').where('userId', '==', userId).limit(1).get();
  const currentScore = scoresSnap.empty ? null : Number(scoresSnap.docs[0].data().score);

  const steps = [];
  let order = 1;

  if (collections.length > 0) {
    const names = collections.slice(0, 3).map(c => String(c.creditorName)).join(', ');
    steps.push({ order: order++, title: 'Dispute Collection Accounts', description: `You have ${collections.length} collection account${collections.length > 1 ? 's' : ''} totaling $${collectionDebt.toLocaleString()} from ${names}${collections.length > 3 ? ' and others' : ''}. Send debt validation letters. Collections removal can boost your score 20-40 points.`, category: 'DISPUTE', impact: 'HIGH', timeframe: '1-2 weeks to send, 30 days for response', completed: false });
  }
  if (medicalCollections.length > 0) {
    const medTotal = medicalCollections.reduce((s, i) => s + (Number(i.balance) || 0), 0);
    steps.push({ order: order++, title: 'Challenge Medical Collections via HIPAA', description: `You have ${medicalCollections.length} medical collection${medicalCollections.length > 1 ? 's' : ''} totaling $${medTotal.toLocaleString()}. Request proof of HIPAA authorization.`, category: 'DISPUTE', impact: 'HIGH', timeframe: '2-4 weeks', completed: false });
  }
  if (chargeOffs.length > 0) {
    const names = chargeOffs.slice(0, 3).map(c => String(c.creditorName)).join(', ');
    steps.push({ order: order++, title: 'Negotiate Charge-Off Removal', description: `You have ${chargeOffs.length} charge-off${chargeOffs.length > 1 ? 's' : ''} from ${names}. Negotiate pay-for-delete with the original creditor's executive office.`, category: 'DISPUTE', impact: 'HIGH', timeframe: '2-6 weeks', completed: false });
  }
  if (highUtilization.length > 0) {
    const details = highUtilization.map(i => `${i.creditorName} (${Math.round((Number(i.balance) / Number(i.creditLimit)) * 100)}% used)`).join('; ');
    steps.push({ order: order++, title: 'Pay Down High Credit Card Balances', description: `Cards with high utilization: ${details}. Pay down to below 30% for an immediate 20-50 point boost.`, category: 'UTILIZATION', impact: 'HIGH', timeframe: '1-3 months', completed: false });
  }
  if (latePayments.length > 0) {
    const names = latePayments.slice(0, 3).map(c => String(c.creditorName)).join(', ');
    steps.push({ order: order++, title: 'Send Goodwill Letters for Late Payments', description: `You have late payment records on ${latePayments.length} account${latePayments.length > 1 ? 's' : ''} including ${names}.`, category: 'DISPUTE', impact: 'MEDIUM', timeframe: '2-4 weeks', completed: false });
  }
  steps.push({ order: order++, title: 'Set Up Automatic Payments on All Accounts', description: 'Enroll every open account in automatic payments. Payment history is 35% of your credit score.', category: 'PAYMENT', impact: 'HIGH', timeframe: '1 week', completed: false });
  if (items.filter(i => i.isDisputable).length > 0) {
    steps.push({ order: order++, title: 'File Disputes with All Three Credit Bureaus', description: 'File formal disputes with Equifax, Experian, and TransUnion for each inaccurate item. Bureaus have 30 days to investigate or must delete.', category: 'DISPUTE', impact: 'HIGH', timeframe: '30-45 days', completed: false });
  }
  steps.push({ order: order++, title: 'Become an Authorized User on a Strong Account', description: 'Ask a family member to add you as an authorized user on their oldest card with perfect history. Can add 20-50 points.', category: 'CREDIT_MIX', impact: 'MEDIUM', timeframe: '1-2 weeks', completed: false });
  steps.push({ order: order++, title: 'Monitor Your Credit Monthly', description: 'Pull and upload your credit reports monthly to track progress and catch new errors early.', category: 'GENERAL', impact: 'LOW', timeframe: 'Ongoing', completed: false });

  const summaryParts = [];
  if (currentScore) summaryParts.push(`Your current score is ${currentScore}.`);
  if (collections.length > 0) summaryParts.push(`You have ${collections.length} collection${collections.length > 1 ? 's' : ''} totaling $${collectionDebt.toLocaleString()} that should be disputed immediately.`);
  if (highUtilization.length > 0) summaryParts.push(`${highUtilization.length} card${highUtilization.length > 1 ? 's are' : ' is'} above 30% utilization — paying these down will give you the fastest score boost.`);
  summaryParts.push(`Follow these ${steps.length} steps in order for maximum impact.`);

  const title = currentScore ? `Your Path from ${currentScore} to 800` : 'Your Path to 800';
  const summary = summaryParts.join(' ');

  await db.collection('actionPlans').add({ userId, reportId, title, summary, steps, createdAt: new Date().toISOString() });
  console.log(`Plan generated with ${steps.length} steps for user ${userId}`);
}

// ── Lambda handler ────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const { reportId, userId, s3Key, bureau = 'UNKNOWN' } = event;
  console.log('analyze-report Lambda started', { reportId, userId, s3Key, bureau });

  const reportRef = db.collection('creditReports').doc(reportId);

  try {
    // 1. Download PDF from S3
    console.log(`Fetching PDF from S3: ${s3Key}`);
    const s3Res = await s3.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    }));

    const chunks = [];
    for await (const chunk of s3Res.Body) {
      chunks.push(chunk);
    }
    const pdfBytes = Buffer.concat(chunks);
    const fileSizeMB = pdfBytes.length / (1024 * 1024);
    console.log(`PDF size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 20) {
      await reportRef.update({ status: 'ERROR', errorMessage: `PDF too large (${fileSizeMB.toFixed(1)}MB). Max 20MB supported.` });
      return;
    }

    // 2. Convert to base64
    const pdfBase64 = pdfBytes.toString('base64');
    console.log(`Base64 size: ${(pdfBase64.length / (1024 * 1024)).toFixed(2)} MB`);

    // 3. Run AI analysis
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      await reportRef.update({ status: 'ERROR', errorMessage: 'GEMINI_API_KEY not configured' });
      return;
    }

    let analysis;
    try {
      console.log('Starting Gemini analysis...');
      analysis = await analyzeWithGemini(pdfBase64, geminiKey, bureau);
      console.log(`Gemini complete. Found ${analysis.items.length} items.`);
    } catch (geminiErr) {
      console.error('Gemini failed:', geminiErr.message);
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (!claudeKey) {
        await reportRef.update({ status: 'ERROR', errorMessage: `AI analysis failed: ${geminiErr.message}` });
        return;
      }
      try {
        console.log('Falling back to Claude...');
        analysis = await analyzeWithClaude(pdfBase64, claudeKey, bureau);
        console.log(`Claude complete. Found ${analysis.items.length} items.`);
      } catch (claudeErr) {
        console.error('Claude also failed:', claudeErr.message);
        await reportRef.update({ status: 'ERROR', errorMessage: `All AI providers failed. Gemini: ${geminiErr.message}. Claude: ${claudeErr.message}` });
        return;
      }
    }

    // 4. Check for duplicate analysis
    const existingSnap = await db.collection('reportItems')
      .where('userId', '==', userId)
      .where('creditReportId', '==', reportId)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      await reportRef.update({ status: 'ANALYZED', analyzedAt: new Date().toISOString() });
      console.log('Report already had items — skipping write, marking ANALYZED');
      return;
    }

    // 5. Save report items (batch write, max 30 to stay within Firestore limits)
    const itemsToSave = analysis.items.slice(0, 30);
    const batch = db.batch();
    for (const item of itemsToSave) {
      const ref = db.collection('reportItems').doc();
      batch.set(ref, { userId, creditReportId: reportId, ...item });
    }
    await batch.commit();
    console.log(`Saved ${itemsToSave.length} report items`);

    // 6. Save credit score if found
    if (analysis.creditScore) {
      await db.collection('creditScores').add({ userId, score: analysis.creditScore, bureau, recordedAt: new Date().toISOString() });
      console.log(`Saved credit score: ${analysis.creditScore}`);
    }

    // 7. Mark report as ANALYZED with summary
    await reportRef.update({ status: 'ANALYZED', analyzedAt: new Date().toISOString(), summary: analysis.summary });

    // 8. Generate action plan
    await generateActionPlan(userId, reportId);

    console.log('analyze-report Lambda complete', { reportId, itemsFound: analysis.items.length });
  } catch (err) {
    console.error('Unhandled error in analyze-report Lambda:', err);
    try {
      await reportRef.update({ status: 'ERROR', errorMessage: String(err.message || err) });
    } catch (updateErr) {
      console.error('Failed to update error status:', updateErr);
    }
  }
};
