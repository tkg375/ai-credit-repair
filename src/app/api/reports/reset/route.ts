import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all items to delete (we'll delete in small batches to avoid subrequest limits)
    const items = await firestore.query(COLLECTIONS.reportItems, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    const scores = await firestore.query(COLLECTIONS.creditScores, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    const disputes = await firestore.query(COLLECTIONS.disputes, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    const reports = await firestore.query(COLLECTIONS.creditReports, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    // Delete up to 10 of each to stay within subrequest limits
    // User may need to click multiple times if they have lots of data
    let deleted = 0;
    const maxDeletes = 10;

    for (const item of items.slice(0, maxDeletes)) {
      await firestore.deleteDoc(COLLECTIONS.reportItems, item.id);
      deleted++;
    }

    for (const score of scores.slice(0, maxDeletes)) {
      await firestore.deleteDoc(COLLECTIONS.creditScores, score.id);
      deleted++;
    }

    for (const dispute of disputes.slice(0, maxDeletes)) {
      await firestore.deleteDoc(COLLECTIONS.disputes, dispute.id);
      deleted++;
    }

    for (const report of reports.slice(0, maxDeletes)) {
      await firestore.deleteDoc(COLLECTIONS.creditReports, report.id);
      deleted++;
    }

    const remaining =
      Math.max(0, items.length - maxDeletes) +
      Math.max(0, scores.length - maxDeletes) +
      Math.max(0, disputes.length - maxDeletes) +
      Math.max(0, reports.length - maxDeletes);

    return NextResponse.json({
      success: true,
      deleted,
      remaining,
      message: remaining > 0
        ? `Deleted ${deleted} items. Click again to delete ${remaining} more.`
        : `All data cleared! Deleted ${deleted} items.`,
    });
  } catch (err) {
    console.error("Reset error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
