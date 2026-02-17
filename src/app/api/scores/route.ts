import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const scores = await firestore.query("creditScores", [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    const sorted = scores.sort((a, b) => {
      const aDate = a.data.recordedAt ? new Date(a.data.recordedAt as string).getTime() : 0;
      const bDate = b.data.recordedAt ? new Date(b.data.recordedAt as string).getTime() : 0;
      return aDate - bDate;
    });

    return NextResponse.json({ scores: sorted.map((s) => ({ id: s.id, ...s.data })) });
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { score, source, bureau, recordedAt, factors } = await req.json();

    if (!score || score < 300 || score > 850) {
      return NextResponse.json({ error: "Score must be between 300 and 850" }, { status: 400 });
    }

    const docId = await firestore.addDoc("creditScores", {
      userId: user.uid,
      score,
      source: source || "Manual Entry",
      bureau: bureau || null,
      recordedAt: recordedAt || new Date().toISOString(),
      factors: factors || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docId, score });
  } catch (error) {
    console.error("Failed to add score:", error);
    return NextResponse.json({ error: "Failed to add score" }, { status: 500 });
  }
}
