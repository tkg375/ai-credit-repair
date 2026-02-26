import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { sendHealthReportEmail } from "@/lib/email";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check if health email was recently sent (within 30 days)
    const userDoc = await firestore.getDoc(COLLECTIONS.users, user.uid);
    const lastSent = userDoc.data.lastHealthEmailSentAt as string | null;
    if (lastSent) {
      const daysSince = (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        return NextResponse.json({ skipped: true });
      }
    }

    const name = (userDoc.data.fullName as string) || (userDoc.data.displayName as string) || "";

    // Fetch credit scores, disputes, and disputable items in parallel
    const [scores, disputes, disputableItems] = await Promise.all([
      firestore.query(COLLECTIONS.creditScores, [
        { field: "userId", op: "EQUAL", value: user.uid },
      ]),
      firestore.query(COLLECTIONS.disputes, [
        { field: "userId", op: "EQUAL", value: user.uid },
      ]),
      firestore.query(COLLECTIONS.reportItems, [
        { field: "userId", op: "EQUAL", value: user.uid },
        { field: "isDisputable", op: "EQUAL", value: true },
      ]),
    ]);

    // Compute latest score and score change
    const sortedScores = scores.sort((a, b) => {
      const aTime = a.data.recordedAt ? new Date(a.data.recordedAt as string).getTime() : 0;
      const bTime = b.data.recordedAt ? new Date(b.data.recordedAt as string).getTime() : 0;
      return bTime - aTime;
    });

    const latestScore = sortedScores.length > 0 ? (sortedScores[0].data.score as number) : null;
    const oldestScore = sortedScores.length > 1 ? (sortedScores[sortedScores.length - 1].data.score as number) : null;
    const scoreChange = latestScore !== null && oldestScore !== null ? latestScore - oldestScore : null;

    // Compute dispute stats
    const sentCount = disputes.filter((d) => d.data.status === "SENT" || d.data.status === "UNDER_INVESTIGATION").length;
    const resolvedCount = disputes.filter((d) => d.data.status === "RESOLVED").length;
    const disputableCount = disputableItems.length;

    await sendHealthReportEmail(user.email, name, {
      latestScore,
      scoreChange,
      sentCount,
      resolvedCount,
      disputableCount,
    });

    // Update lastHealthEmailSentAt
    await firestore.updateDoc(COLLECTIONS.users, user.uid, {
      lastHealthEmailSentAt: new Date().toISOString(),
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("health-report error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
