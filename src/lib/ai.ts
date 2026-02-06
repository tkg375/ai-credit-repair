import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeReportItem(item: {
  accountName: string;
  accountNumber?: string | null;
  accountType: string;
  balance?: number | null;
  creditLimit?: number | null;
  paymentStatus?: string | null;
  dateOpened?: string | null;
  dateReported?: string | null;
}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a credit report analyst. Analyze credit report line items and identify potential inaccuracies or disputable issues. Consider:
- Whether the account status is correctly reported
- Whether dates are accurate and within statute of limitations (7 years for most negatives, 10 years for bankruptcies)
- Whether balance and credit limit figures seem consistent
- Whether there are signs of re-aging, duplicate reporting, or identity errors
- Relevant FCRA sections that apply

Respond with JSON: { "isDisputable": boolean, "isNegative": boolean, "issues": string[], "recommendation": string, "legalBasis": string }`,
      },
      {
        role: "user",
        content: `Analyze this credit report item:\n${JSON.stringify(item, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateDisputeLetter(params: {
  accountName: string;
  accountType: string;
  reason: string;
  issues: string[];
  bureau: string;
  userName: string;
  legalBasis?: string;
}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a consumer rights expert specializing in credit repair under the Fair Credit Reporting Act (FCRA) and Fair Debt Collection Practices Act (FDCPA).

Generate a professional, detailed dispute letter to a credit bureau. The letter must:
- Be specific and evidence-based (not generic -- the 2026 FCRA updates reject generic disputes)
- Reference the specific FCRA sections that apply (Section 611, 609, 623, etc.)
- Clearly state the inaccuracy and requested correction
- Include a request for investigation within 30 days per FCRA requirements
- Be professional and legally sound
- Request method of verification per Section 611

Do NOT include any false claims. Only dispute items based on the identified issues.`,
      },
      {
        role: "user",
        content: `Generate a dispute letter with these details:
Bureau: ${params.bureau}
Consumer Name: ${params.userName}
Account: ${params.accountName} (${params.accountType})
Dispute Reason: ${params.reason}
Identified Issues: ${params.issues.join(", ")}
Legal Basis: ${params.legalBasis || "FCRA Section 611 - Procedure in case of disputed accuracy"}`,
      },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function generateActionPlan(params: {
  currentScore?: number;
  reportItems: Array<{
    accountName: string;
    accountType: string;
    isNegative: boolean;
    balance?: number | null;
    creditLimit?: number | null;
    paymentStatus?: string | null;
  }>;
}) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a credit improvement strategist. Create a personalized action plan to improve a consumer's credit score. Consider all five FICO score factors:
1. Payment History (35%) - on-time payments, catching up on past-due
2. Credit Utilization (30%) - keeping under 30%, ideally under 10%
3. Length of Credit History (15%) - keeping old accounts open
4. New Credit (10%) - limiting hard inquiries
5. Credit Mix (10%) - diversifying account types

Respond with JSON: {
  "title": string,
  "steps": [{ "order": number, "title": string, "description": string, "category": "PAYMENT_HISTORY" | "UTILIZATION" | "CREDIT_AGE" | "NEW_CREDIT" | "CREDIT_MIX" | "DISPUTE", "impact": "HIGH" | "MEDIUM" | "LOW" }]
}

Prioritize high-impact actions first. Be specific and actionable.`,
      },
      {
        role: "user",
        content: `Create an action plan for this profile:
Current Score: ${params.currentScore || "Unknown"}
Accounts: ${JSON.stringify(params.reportItems, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
