import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";
import { getValidConsent } from "@/lib/fcra-consent";
import { firestore } from "@/lib/db";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription(user.uid);
  if (!sub.isAutopilot) {
    return NextResponse.json({ error: "Autopilot subscription required" }, { status: 403 });
  }

  const [consent, userDoc, recentRuns] = await Promise.all([
    getValidConsent(user.uid),
    firestore.getDoc("users", user.uid),
    firestore.query(
      "autopilotRuns",
      [{ field: "userId", op: "EQUAL", value: user.uid }],
      "startedAt",
      "DESCENDING",
      10
    ),
  ]);

  const lastRun = recentRuns[0] || null;
  const lastRunAt = lastRun ? (lastRun.data.startedAt as string) : null;

  // Cooldown: 30 days between runs
  const cooldownMs = 30 * 24 * 60 * 60 * 1000;
  const nextRunAt =
    lastRunAt && lastRun?.data.status === "completed"
      ? new Date(new Date(lastRunAt).getTime() + cooldownMs).toISOString()
      : null;

  const runningRun = recentRuns.find((r) => r.data.status === "running") || null;

  return NextResponse.json({
    isActive: userDoc.data.autopilotEnabled !== false,
    hasValidConsent: !!consent,
    consentedAt: consent?.consentedAt || null,
    lastRunAt,
    nextRunAt,
    currentlyRunning: !!runningRun,
    currentRunId: runningRun?.id || null,
    totalRunsCompleted: recentRuns.filter((r) => r.data.status === "completed").length,
    totalLettersSent: recentRuns.reduce(
      (sum, r) => sum + ((r.data.lettersMailed as number) || 0),
      0
    ),
    recentRuns: recentRuns.slice(0, 5).map((r) => ({
      id: r.id,
      status: r.data.status,
      startedAt: r.data.startedAt,
      completedAt: r.data.completedAt || null,
      itemsFound: r.data.itemsFound || 0,
      lettersGenerated: r.data.lettersGenerated || 0,
      lettersMailed: r.data.lettersMailed || 0,
      errors: r.data.errors || [],
    })),
  });
}
