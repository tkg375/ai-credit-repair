import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing dispute id" }, { status: 400 });

  let body: {
    bureauResponse?: string;
    bureauResponseOutcome?: string;
    responseReceivedAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { bureauResponse, bureauResponseOutcome, responseReceivedAt } = body;

  const validOutcomes = ["deleted", "verified", "updated", "no_response"];
  if (bureauResponseOutcome && !validOutcomes.includes(bureauResponseOutcome)) {
    return NextResponse.json({ error: "Invalid bureauResponseOutcome" }, { status: 400 });
  }

  const dispute = await firestore.getDoc(COLLECTIONS.disputes, id);
  if (!dispute.exists) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  if (dispute.data.userId !== user.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const updates: Record<string, unknown> = {
    bureauResponse: bureauResponse ?? null,
    bureauResponseOutcome: bureauResponseOutcome ?? null,
    responseReceivedAt: responseReceivedAt ?? null,
    updatedAt: new Date().toISOString(),
  };

  if (bureauResponseOutcome === "deleted") {
    updates.status = "RESOLVED";
    updates.resolvedAt = new Date().toISOString();
  }

  await firestore.updateDoc(COLLECTIONS.disputes, id, updates);

  return NextResponse.json({ updated: true, updates });
}
