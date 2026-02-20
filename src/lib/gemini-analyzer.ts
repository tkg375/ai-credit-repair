// Google Gemini API for credit report analysis

// Using gemini-2.0-flash for PDF processing
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface CreditReportItem {
  creditorName: string;
  originalCreditor: string | null;
  accountNumber: string;
  accountType: string;
  balance: number;
  originalBalance: number | null;
  creditLimit: number | null;
  status: string;
  dateOpened: string | null;
  dateOfFirstDelinquency: string | null;
  lastActivityDate: string | null;
  latePayments: string[];
  isDisputable: boolean;
  disputeReason: string | null;
  removalStrategies: {
    method: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    successRate: string;
  }[];
  bureau: string;
}

interface AnalysisResult {
  items: CreditReportItem[];
  creditScore: number | null;
  summary: {
    totalAccounts: number;
    negativeItems: number;
    collections: number;
    latePayments: number;
    totalDebt: number;
    potentialRemovalAmount: number;
  };
}

const ANALYSIS_PROMPT = `You are a credit report analyzer. Your task is to extract ALL negative/derogatory items from this credit report with 100% accuracy.

STEP 1: Identify the credit bureau (Equifax, Experian, or TransUnion) from the report header/branding.

STEP 2: Find the credit score if displayed in the report.

STEP 3: Extract EVERY account that has ANY of these negative indicators:
- Status contains: Collection, Charge-off, Charged off, Past due, Delinquent, Late, Written off, Sold, Transferred, Closed negative, Settled, Repossession, Foreclosure, Bankruptcy, Judgment, Tax lien
- Payment status shows any late payments (30, 60, 90, 120+ days)
- Account is marked as derogatory or adverse
- Balance owed on collection accounts
- Any account with negative remarks

STEP 4: For EACH negative account found, extract:
- creditorName: The company name (creditor, collection agency, or furnisher)
- accountNumber: Full or partial account number shown
- accountType: Collection, Credit Card, Auto Loan, Mortgage, Student Loan, Medical, Personal Loan, Utility, etc.
- balance: Current balance owed (number only, no $ or commas)
- status: The account status (COLLECTION, CHARGE_OFF, LATE, DELINQUENT, etc.)
- dateOpened: Date opened or date of first delinquency (YYYY-MM-DD format)
- disputeReason: Why this item may be disputable (e.g., "Debt validation required", "Verify account ownership", "Check statute of limitations", "Possible reporting error")

IMPORTANT RULES:
- Do NOT skip any negative items - be thorough
- Include ALL collections, even medical or small amounts
- Include accounts with late payment history even if now current
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

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 500 || status === 502;
}

function getRetryDelay(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      return Math.min(seconds * 1000, MAX_DELAY_MS);
    }
  }
  // Exponential backoff with jitter: 2s, 4s, 8s, 16s (+ up to 1s random)
  const exponentialDelay = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, MAX_DELAY_MS);
}

export async function analyzeWithGemini(
  pdfBase64: string,
  apiKey: string,
  bureau: string = "UNKNOWN"
): Promise<AnalysisResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1, lastError?.cause as string | null);
      console.log(`Gemini API retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          topP: 1,
          topK: 1,
          maxOutputTokens: 65536,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const retryAfter = response.headers.get("retry-after");

      if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
        console.warn(
          `Gemini API returned ${response.status} (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${JSON.stringify(errorData)}`
        );
        lastError = new Error(
          `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`,
          { cause: retryAfter }
        );
        continue;
      }

      throw new Error(
        `Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No response from Gemini");
    }

    // Parse JSON from response (Gemini might wrap it in markdown code blocks)
    let jsonStr = content;

    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to find JSON object in the response
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonStr.trim());

      // Detect bureau from AI response or use provided default
      const detectedBureau = parsed.bureau || bureau;
      // Normalize bureau names
      const normalizedBureau = detectedBureau.toLowerCase().includes("equifax") ? "Equifax"
        : detectedBureau.toLowerCase().includes("experian") ? "Experian"
        : detectedBureau.toLowerCase().includes("transunion") ? "TransUnion"
        : detectedBureau;

      // Process items with detailed removal strategies
      const items = (parsed.items || []).map((item: Record<string, unknown>) => {
        const status = String(item.status || "UNKNOWN").toUpperCase();
        const balance = Number(item.balance) || 0;
        const accountType = String(item.accountType || "Unknown");

        // Generate removal strategies based on account type and status
        const removalStrategies = generateRemovalStrategies(status, accountType, balance);

        return {
          creditorName: item.creditorName || "Unknown",
          originalCreditor: item.originalCreditor || null,
          accountNumber: item.accountNumber || "****",
          accountType: accountType,
          balance: balance,
          originalBalance: item.originalBalance ? Number(item.originalBalance) : null,
          creditLimit: item.creditLimit ? Number(item.creditLimit) : null,
          status: status,
          dateOpened: item.dateOpened || null,
          dateOfFirstDelinquency: item.dateOfFirstDelinquency || null,
          lastActivityDate: item.lastActivityDate || null,
          latePayments: item.latePayments || [],
          isDisputable: true,
          disputeReason: item.disputeReason || "Request validation of debt",
          removalStrategies: removalStrategies,
          bureau: normalizedBureau,
        };
      });

      const result: AnalysisResult = {
        items,
        creditScore: parsed.score || parsed.creditScore || null,
        summary: {
          totalAccounts: items.length,
          negativeItems: items.length,
          collections: items.filter((i: CreditReportItem) =>
            i.status.includes("COLLECTION") || i.accountType.toLowerCase().includes("collection")
          ).length,
          latePayments: items.filter((i: CreditReportItem) =>
            i.status.includes("LATE") || i.latePayments?.length > 0
          ).length,
          totalDebt: items.reduce((sum: number, i: CreditReportItem) => sum + (i.balance || 0), 0),
          potentialRemovalAmount: items.reduce((sum: number, i: CreditReportItem) => sum + (i.balance || 0), 0),
        },
      };

      return result;
    } catch (parseError) {
      console.error("Failed to parse Gemini response. Raw content:", content.substring(0, 1000));
      throw new Error(`Failed to parse AI response. Please try again.`);
    }
  }

  // All retries exhausted
  throw lastError || new Error("Gemini API failed after all retries");
}

function generateRemovalStrategies(status: string, accountType: string, balance: number) {
  const strategies: {
    method: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    successRate: string;
  }[] = [];

  const isCollection = status.includes("COLLECTION") || accountType.toLowerCase().includes("collection");
  const isChargeOff = status.includes("CHARGE") || status.includes("WRITTEN");
  const isMedical = accountType.toLowerCase().includes("medical");
  const isLate = status.includes("LATE") || status.includes("DELINQUENT") || status.includes("PAST");

  // 1. Debt Validation Letter - HIGH priority for collections
  if (isCollection) {
    strategies.push({
      method: "Debt Validation Letter (FDCPA Section 809)",
      description: "Send within 30 days of first contact. Demand: original creditor name, original account number, amount owed breakdown, proof collector owns the debt, and your signed contract. Collector must cease collection until validated.",
      priority: "HIGH",
      successRate: "65-75%"
    });
  }

  // 2. Pay for Delete Negotiation
  if (isCollection || isChargeOff) {
    strategies.push({
      method: "Pay for Delete Negotiation",
      description: `Offer to pay ${balance < 500 ? "full amount" : "30-50% of the $" + balance.toLocaleString() + " balance"} in exchange for complete removal from all three credit bureaus. ALWAYS get the agreement in writing before sending payment. Never pay without written deletion agreement.`,
      priority: balance < 1000 ? "HIGH" : "MEDIUM",
      successRate: "40-60%"
    });
  }

  // 3. HIPAA Violation Check for medical
  if (isMedical) {
    strategies.push({
      method: "HIPAA Privacy Violation Dispute",
      description: "Medical debts require proper authorization to report. Demand proof of HIPAA-compliant authorization, itemized bill with procedure codes, and proof the debt collector has legal right to your medical information. Many medical collections violate HIPAA.",
      priority: "HIGH",
      successRate: "50-70%"
    });
  }

  // 4. Direct Bureau Dispute (FCRA Section 611)
  strategies.push({
    method: "Credit Bureau Dispute (FCRA Section 611)",
    description: "File disputes directly with Equifax, Experian, and TransUnion. Cite specific inaccuracies: wrong balance, incorrect dates, wrong account number, accounts not yours, or incomplete information. Bureau has 30 days to investigate or must delete.",
    priority: "HIGH",
    successRate: "30-40%"
  });

  // 5. Method of Verification Request
  strategies.push({
    method: "Method of Verification Request (FCRA Section 611(a)(6))",
    description: "After bureau claims 'verified', send follow-up demanding HOW they verified: who they contacted, what documents reviewed, what method used. If they can't provide specific verification method, dispute again citing inadequate investigation.",
    priority: "HIGH",
    successRate: "25-35%"
  });

  // 6. Original Contract Request
  if (isCollection || isChargeOff) {
    strategies.push({
      method: "Original Signed Contract Request",
      description: "Demand the original signed contract/agreement with your signature. Debt buyers often cannot produce this document because it wasn't transferred with the debt. No contract = no proof you agreed to the debt terms.",
      priority: "HIGH",
      successRate: "45-55%"
    });
  }

  // 7. Statute of Limitations Defense
  strategies.push({
    method: "Statute of Limitations Review",
    description: "Check if debt is past your state's SOL (typically 3-6 years from last activity). Time-barred debts cannot be sued for. Warning: Making a payment or acknowledging the debt can restart the clock.",
    priority: "MEDIUM",
    successRate: "20-30%"
  });

  // 8. 7-Year Reporting Limit Check
  strategies.push({
    method: "7-Year Reporting Limit Verification (FCRA Section 605)",
    description: "Negative items must be removed 7 years from the date of first delinquency. Verify the reported date is accurate. If the date has been re-aged (moved forward), dispute as FCRA violation.",
    priority: "MEDIUM",
    successRate: "35-45%"
  });

  // 9. Goodwill Letter for late payments
  if (isLate) {
    strategies.push({
      method: "Goodwill Adjustment Letter",
      description: "Write directly to original creditor's executive office requesting removal as a goodwill gesture. Mention your positive payment history, loyalty as a customer, and any hardship circumstances. Works best if account is now current.",
      priority: "MEDIUM",
      successRate: "15-25%"
    });
  }

  // 10. Cease and Desist + Dispute Combo
  if (isCollection) {
    strategies.push({
      method: "Cease & Desist with Dispute",
      description: "Send cease and desist letter demanding collector stop all contact while simultaneously disputing with credit bureaus. Collector cannot verify a disputed debt while honoring cease and desist, often resulting in deletion.",
      priority: "MEDIUM",
      successRate: "30-40%"
    });
  }

  // 11. CFPB Complaint
  strategies.push({
    method: "CFPB Complaint Filing",
    description: "File complaint with Consumer Financial Protection Bureau (consumerfinance.gov). Companies must respond within 15 days. CFPB complaints often get faster resolution than direct disputes. Document all previous dispute attempts.",
    priority: "MEDIUM",
    successRate: "25-35%"
  });

  // 12. State Attorney General Complaint
  strategies.push({
    method: "State Attorney General Complaint",
    description: "File complaint with your state's Attorney General consumer protection division. Some states have stronger consumer protection laws than federal. Can result in investigation of collector's practices.",
    priority: "LOW",
    successRate: "15-25%"
  });

  // 13. Creditor Direct Negotiation
  if (isChargeOff) {
    strategies.push({
      method: "Original Creditor Settlement",
      description: "Contact original creditor directly (before it goes to collections) to negotiate. Offer lump sum payment for deletion or 'paid as agreed' status update. Original creditors have more flexibility than collectors.",
      priority: "MEDIUM",
      successRate: "35-45%"
    });
  }

  // 14. Insurance Verification for Medical
  if (isMedical) {
    strategies.push({
      method: "Insurance Payment Verification",
      description: "Request proof that insurance was properly billed before debt went to collections. Many medical debts are sent to collections before insurance processes the claim. Verify EOB matches the billed amount.",
      priority: "HIGH",
      successRate: "40-50%"
    });
  }

  // Sort by priority (HIGH first, then MEDIUM, then LOW)
  const priorityOrder = { "HIGH": 0, "MEDIUM": 1, "LOW": 2 };
  strategies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return strategies;
}
