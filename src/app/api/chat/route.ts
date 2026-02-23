import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are an expert credit repair advisor for Credit 800, an AI-powered credit repair platform. You help users understand and improve their credit scores.

You have deep expertise in:
- Fair Credit Reporting Act (FCRA) — especially Sections 609, 611, 623
- Fair Debt Collection Practices Act (FDCPA)
- Credit bureau dispute processes (Equifax, Experian, TransUnion)
- Debt validation and pay-for-delete strategies
- Credit score factors (payment history 35%, utilization 30%, age 15%, mix 10%, new credit 10%)
- Statute of limitations on debts by state
- CFPB complaint process
- Goodwill letters and goodwill deletion
- Credit rebuilding with secured and credit-builder cards
- Understanding credit reports: charge-offs, collections, late payments, hard inquiries

Keep responses:
- Concise and actionable (2–4 sentences unless more detail is needed)
- Legally accurate — explain consumer rights without giving legal advice
- Specific to the credit repair context the user is asking about
- Warm and encouraging — users are often stressed about their finances

Do NOT:
- Guarantee specific score improvements or outcomes
- Recommend any fraudulent activity (dispute filing false claims, file segregation, etc.)
- Give investment or tax advice
- Make up specific statistics`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Validate message format and limit history
    const validMessages = messages
      .slice(-20)
      .filter(
        (m: { role: string; content: string }) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      );

    if (validMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2024-01-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: validMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Claude API error:", error);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
