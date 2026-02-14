// Claude API for credit report analysis

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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

const ANALYSIS_PROMPT = `You are an expert credit report analyst. Analyze this credit report PDF and extract ALL account information.

For EACH account/tradeline found, extract:
1. Creditor/Company Name
2. Original Creditor (if it's a collection)
3. Account Number (last 4 digits or masked version shown)
4. Account Type (Credit Card, Auto Loan, Mortgage, Collection, Medical Collection, Student Loan, Personal Loan, etc.)
5. Current Balance
6. Original Balance (if shown)
7. Credit Limit (if applicable)
8. Account Status (CURRENT, DELINQUENT, COLLECTION, CHARGED_OFF, CLOSED, PAID)
9. Date Opened
10. Date of First Delinquency (important for 7-year rule)
11. Last Activity Date
12. Any Late Payments (list the months, e.g., ["2023-06", "2023-07"])

For each account, determine:
- Is it disputable? (collections, charge-offs, late payments, or any negative marks are disputable)
- What's the best dispute reason?
- What removal strategies apply?

Removal strategies to consider:
- "Statute of Limitations" - if debt is old (check state SOL, typically 3-6 years)
- "Debt Validation" - for collections, especially from debt buyers
- "Credit Report Age-Off" - if approaching 7 years from first delinquency
- "Pay-for-Delete" - for collections, negotiate deletion for payment
- "Goodwill Letter" - for late payments on otherwise good accounts
- "HIPAA Violation" - for medical collections
- "Insurance Verification" - for medical collections
- "Balance Discrepancy" - if current balance is much higher than original
- "Re-age Account" - for accounts that can be brought current
- "Credit Limit Increase" - for high utilization accounts

Also extract:
- Credit Score (if shown)
- Summary statistics

Return your analysis as valid JSON in this exact format:
{
  "items": [
    {
      "creditorName": "Company Name",
      "originalCreditor": "Original Company" or null,
      "accountNumber": "****1234",
      "accountType": "Collection",
      "balance": 1500,
      "originalBalance": 1200 or null,
      "creditLimit": null,
      "status": "COLLECTION",
      "dateOpened": "2020-01-15" or null,
      "dateOfFirstDelinquency": "2019-08-01" or null,
      "lastActivityDate": "2021-03-20" or null,
      "latePayments": [],
      "isDisputable": true,
      "disputeReason": "Collection account - request debt validation",
      "removalStrategies": [
        {
          "method": "Debt Validation",
          "description": "Request proof of debt ownership and original signed agreement",
          "priority": "HIGH",
          "successRate": "70%"
        }
      ],
      "bureau": "EQUIFAX"
    }
  ],
  "creditScore": 650 or null,
  "summary": {
    "totalAccounts": 15,
    "negativeItems": 5,
    "collections": 3,
    "latePayments": 2,
    "totalDebt": 25000,
    "potentialRemovalAmount": 8500
  }
}

IMPORTANT:
- Extract EVERY account you can find, not just negative ones
- Be thorough - a 200+ page report may have many accounts
- For accounts in good standing, still include them but mark isDisputable as false
- Identify the bureau from the report header (Equifax, Experian, or TransUnion)
- Return ONLY the JSON, no other text`;

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503 || status === 500 || status === 502 || status === 529;
}

function getRetryDelay(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      return Math.min(seconds * 1000, MAX_DELAY_MS);
    }
  }
  const exponentialDelay = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, MAX_DELAY_MS);
}

export async function analyzeWithClaude(
  pdfBase64: string,
  apiKey: string,
  bureau: string = "UNKNOWN"
): Promise<AnalysisResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = getRetryDelay(attempt - 1, lastError?.cause as string | null);
      console.log(`Claude API retry ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2024-01-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const retryAfter = response.headers.get("retry-after");

      if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
        console.warn(
          `Claude API returned ${response.status} (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${JSON.stringify(errorData)}`
        );
        lastError = new Error(
          `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`,
          { cause: retryAfter }
        );
        continue;
      }

      throw new Error(
        `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error("No response from Claude");
    }

    // Parse JSON from response (Claude might wrap it in markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    try {
      const result = JSON.parse(jsonStr.trim()) as AnalysisResult;

      // Add bureau to all items if not already set
      result.items = result.items.map(item => ({
        ...item,
        bureau: item.bureau || bureau,
      }));

      return result;
    } catch (parseError) {
      console.error("Failed to parse Claude response:", content);
      throw new Error("Failed to parse analysis results");
    }
  }

  throw lastError || new Error("Claude API failed after all retries");
}
