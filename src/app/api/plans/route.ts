import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = await firestore.query(
    COLLECTIONS.actionPlans,
    [{ field: "userId", op: "EQUAL", value: user.uid }],
    "createdAt",
    "DESCENDING",
    1
  );

  if (plans.length === 0) {
    return NextResponse.json({ plan: null });
  }

  return NextResponse.json({ plan: { id: plans[0].id, ...plans[0].data } });
}
