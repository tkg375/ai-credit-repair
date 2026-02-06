// Google Gemini API for credit report analysis

// Using gemini-2.0-flash for PDF processing
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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

const ANALYSIS_PROMPT = `Extract ONLY negative items (collections, charge-offs, late payments, delinquent accounts) from this credit report. Skip accounts in good standing.

Return compact JSON:
{"items":[{"n":"Creditor Name","a":"****1234","t":"Collection","b":1500,"s":"COLLECTION","d":"2020-01-15","r":"Debt validation needed"}],"score":650}

n=creditorName, a=accountNumber, t=accountType, b=balance, s=status, d=dateOpened, r=disputeReason

Return ONLY the JSON, no markdown, no explanation.`;

export async function analyzeWithGemini(
  pdfBase64: string,
  apiKey: string,
  bureau: string = "UNKNOWN"
): Promise<AnalysisResult> {
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
        maxOutputTokens: 65536,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
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

    // Handle compact format (short keys) or full format
    const items = (parsed.items || []).map((item: Record<string, unknown>) => ({
      creditorName: item.n || item.creditorName || "Unknown",
      originalCreditor: item.originalCreditor || null,
      accountNumber: item.a || item.accountNumber || "****",
      accountType: item.t || item.accountType || "Unknown",
      balance: item.b || item.balance || 0,
      originalBalance: item.originalBalance || null,
      creditLimit: item.creditLimit || null,
      status: item.s || item.status || "UNKNOWN",
      dateOpened: item.d || item.dateOpened || null,
      dateOfFirstDelinquency: item.dateOfFirstDelinquency || null,
      lastActivityDate: item.lastActivityDate || null,
      latePayments: item.latePayments || [],
      isDisputable: true, // All items from this query are disputable
      disputeReason: item.r || item.disputeReason || "Request validation",
      removalStrategies: item.removalStrategies || [
        { method: "Debt Validation", description: "Request proof of debt", priority: "HIGH" as const, successRate: "70%" }
      ],
      bureau: item.bureau || bureau,
    }));

    const result: AnalysisResult = {
      items,
      creditScore: parsed.score || parsed.creditScore || null,
      summary: {
        totalAccounts: items.length,
        negativeItems: items.length,
        collections: items.filter((i: CreditReportItem) => i.status === "COLLECTION").length,
        latePayments: items.filter((i: CreditReportItem) => i.latePayments?.length > 0).length,
        totalDebt: items.reduce((sum: number, i: CreditReportItem) => sum + (i.balance || 0), 0),
        potentialRemovalAmount: items.reduce((sum: number, i: CreditReportItem) => sum + (i.balance || 0), 0),
      },
    };

    return result;
  } catch (parseError) {
    console.error("Failed to parse Gemini response. Raw content:", content.substring(0, 500));
    throw new Error(`Failed to parse: ${content.substring(0, 200)}`);
  }
}
