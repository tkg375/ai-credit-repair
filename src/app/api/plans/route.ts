import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const plans = await firestore.query(COLLECTIONS.actionPlans, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    if (plans.length === 0) {
      return NextResponse.json({ plan: null });
    }

    // Sort by createdAt DESC in JS to avoid composite index requirement
    const sorted = plans.sort((a, b) => {
      const aTime = a.data.createdAt ? new Date(a.data.createdAt as string).getTime() : 0;
      const bTime = b.data.createdAt ? new Date(b.data.createdAt as string).getTime() : 0;
      return bTime - aTime;
    });

    const latest = sorted[0];
    return NextResponse.json({ plan: { id: latest.id, ...latest.data } });
  } catch (err) {
    console.error("GET /api/plans error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
