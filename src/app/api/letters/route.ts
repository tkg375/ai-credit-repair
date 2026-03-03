import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const docs = await firestore.query(COLLECTIONS.creditorLetters, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    type LetterRow = { id: string; uploadedAt: string; [key: string]: unknown };
    const letters = (docs.map((d) => ({ id: d.id, ...d.data })) as LetterRow[])
      .sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1));

    return NextResponse.json({ letters });
  } catch (error) {
    console.error("Failed to fetch letters:", error);
    return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
  }
}
