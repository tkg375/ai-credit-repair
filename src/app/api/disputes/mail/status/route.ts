import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { getJobStatus, getTracking } from "@/lib/click2mail";

// Map Click2Mail job statuses to our internal status values
function normalizeStatus(click2mailStatus: string): string {
  const s = click2mailStatus.toUpperCase();
  if (s === "MAILED") return "MAILED";
  if (s === "IN_PRODUCTION" || s === "AWAITING_PRODUCTION") return "IN_PRODUCTION";
  if (s === "ERROR") return "ERROR";
  if (s === "ORDER_SUBMITTED" || s === "PROOF_ACCEPTED") return "SUBMITTED";
  return "SUBMITTED";
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disputeId = request.nextUrl.searchParams.get("disputeId");
  if (!disputeId) {
    return NextResponse.json({ error: "disputeId query parameter is required" }, { status: 400 });
  }

  try {
    // Fetch the dispute
    const dispute = await firestore.getDoc(COLLECTIONS.disputes, disputeId);

    if (!dispute.exists) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.data.userId !== user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const mailJobId = dispute.data.mailJobId as string | undefined;
    if (!mailJobId) {
      return NextResponse.json({ error: "This dispute has not been mailed" }, { status: 400 });
    }

    // Fetch status from Click2Mail
    const jobStatus = await getJobStatus(mailJobId);
    const tracking = await getTracking(mailJobId);

    const normalizedStatus = normalizeStatus(jobStatus.status);

    // Update Firestore with latest status
    const updateData: Record<string, unknown> = {
      mailStatus: normalizedStatus,
      updatedAt: new Date().toISOString(),
    };

    if (tracking) {
      updateData.mailTracking = {
        barcode: tracking.barcode || null,
        status: tracking.status || null,
        lastUpdate: tracking.statusDate || null,
      };
    }

    await firestore.updateDoc(COLLECTIONS.disputes, disputeId, updateData);

    return NextResponse.json({
      mailJobId,
      mailStatus: normalizedStatus,
      click2mailStatus: jobStatus.status,
      description: jobStatus.description,
      tracking: tracking || null,
    });
  } catch (error) {
    console.error("Mail status check failed:", error);
    return NextResponse.json(
      { error: "Failed to check mail status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
