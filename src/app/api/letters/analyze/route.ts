import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const ANALYZE_PROMPT = `You are a consumer rights and credit law expert. A user has uploaded a letter received from a creditor, debt collector, or credit bureau.

Carefully analyze the letter and extract the following information. Return ONLY valid JSON in this exact format:

{
  "creditorName": "string or null",
  "letterDate": "YYYY-MM-DD or null",
  "letterType": "collection_notice" | "demand_letter" | "settlement_offer" | "judgment_notice" | "debt_validation_response" | "cease_and_desist_response" | "other",
  "keyClaimsAndDemands": ["claim or demand 1", "claim or demand 2"],
  "amountClaimed": number or null,
  "deadline": "YYYY-MM-DD or null",
  "yourLegalRights": [
    "Right 1 under FCRA/FDCPA/CFPB (specific and actionable)",
    "Right 2 under FCRA/FDCPA/CFPB (specific and actionable)"
  ],
  "recommendedActions": [
    {
      "action": "Short action title",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "description": "Detailed explanation of what to do and why"
    }
  ],
  "draftResponseLetter": "Full formatted letter text the user can send in response, including [YOUR NAME], [YOUR ADDRESS], [DATE] placeholders"
}

Guidelines:
- keyClaimsAndDemands: List every specific claim, debt amount, demand, or threat in the letter
- amountClaimed: Extract the exact dollar amount if stated, otherwise null
- deadline: Extract any response deadline or due date if mentioned, otherwise null
- yourLegalRights: List 3-6 specific legal rights applicable under FCRA, FDCPA, or other consumer protection laws based on the letter type
- recommendedActions: Provide 3-5 prioritized actions the consumer should take, ordered by urgency
- draftResponseLetter: Write a professional, legally-informed response letter the consumer can customize and send. Include appropriate legal citations (FDCPA Section 809, FCRA Section 611, etc.) where relevant`;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI service not configured" }, { status: 503 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file.type || "application/pdf";

  const isPdf = mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const contentBlock = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mimeType, data: base64 },
      };

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2024-01-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: ANALYZE_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Claude response");

    const analysis = JSON.parse(jsonMatch[0]);

    const letterId = await firestore.addDoc(COLLECTIONS.creditorLetters, {
      userId: user.uid,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      creditorName: analysis.creditorName ?? null,
      letterDate: analysis.letterDate ?? null,
      letterType: analysis.letterType ?? "other",
      keyClaimsAndDemands: analysis.keyClaimsAndDemands ?? [],
      amountClaimed: analysis.amountClaimed ?? null,
      deadline: analysis.deadline ?? null,
      yourLegalRights: analysis.yourLegalRights ?? [],
      recommendedActions: analysis.recommendedActions ?? [],
      draftResponseLetter: analysis.draftResponseLetter ?? "",
    });

    return NextResponse.json({ letterId, analysis });
  } catch (err) {
    console.error("analyze-letter error:", err);
    return NextResponse.json(
      { error: "Failed to analyze letter", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
