import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { sendAnalysisCompleteEmail } from "@/lib/email";

/**
 * GET /api/reports/status?reportId=...
 * Returns the current processing status of a credit report.
 * Used by the upload page to poll while Lambda analysis runs in the background.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");

  if (!reportId) {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }

  try {
    const report = await firestore.getDoc(COLLECTIONS.creditReports, reportId);
    if (!report.exists) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.data.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const status = report.data.status as string;

    // Send one-time email when analysis completes
    if (status === "ANALYZED" && !report.data.analysisEmailSent && user.email) {
      try {
        const profileDoc = await firestore.getDoc(COLLECTIONS.users, user.uid).catch(() => null);
        const name = (profileDoc?.data?.fullName as string) || "";
        const bureau = (report.data.bureau as string) || "your";
        const itemCount = (report.data.itemCount as number) || 0;
        await firestore.updateDoc(COLLECTIONS.creditReports, reportId, { analysisEmailSent: true });
        sendAnalysisCompleteEmail(user.email, name, itemCount, bureau).catch(() => {});
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({
      status,
      errorMessage: (report.data.errorMessage as string) || null,
    });
  } catch (err) {
    console.error("Status check error:", err);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
