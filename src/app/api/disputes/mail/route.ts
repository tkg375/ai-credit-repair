import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { generateLetterPdf } from "@/lib/pdf-letter";
import {
  uploadDocument,
  uploadAddressList,
  createJob,
  submitJob,
  type Click2MailAddress,
} from "@/lib/click2mail";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { disputeId } = body;

  if (!disputeId) {
    return NextResponse.json({ error: "disputeId is required" }, { status: 400 });
  }

  try {
    // Fetch the dispute from Firestore
    const dispute = await firestore.getDoc(COLLECTIONS.disputes, disputeId);

    if (!dispute.exists) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Verify ownership
    if (dispute.data.userId !== user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check letter content exists
    const letterContent = dispute.data.letterContent as string | undefined;
    if (!letterContent) {
      return NextResponse.json({ error: "Dispute has no letter content" }, { status: 400 });
    }

    // Check that a creditor address is available
    const creditorAddress = dispute.data.creditorAddress as Record<string, unknown> | undefined;
    if (!creditorAddress || !creditorAddress.address) {
      return NextResponse.json(
        { error: "No creditor address available. Delete and re-generate this dispute to auto-lookup the address." },
        { status: 400 }
      );
    }

    // Check if already mailed
    if (dispute.data.mailJobId) {
      return NextResponse.json(
        { error: "This dispute letter has already been mailed", mailJobId: dispute.data.mailJobId },
        { status: 409 }
      );
    }

    // TODO: Add Stripe payment check here before mailing.
    // Example: await verifyPayment(user.uid, disputeId);

    // Step 1: Generate PDF from letter text
    console.log("[mail] Step 1: Generating PDF...");
    const pdfBuffer = await generateLetterPdf(letterContent);
    console.log(`[mail] PDF generated: ${pdfBuffer.length} bytes`);

    // Step 2: Upload PDF to Click2Mail
    const creditorName = (dispute.data.creditorName as string) || "Dispute";
    const documentName = `dispute-${creditorName.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30)}-${Date.now()}`;
    console.log(`[mail] Step 2: Uploading document "${documentName}"...`);
    const documentId = await uploadDocument(pdfBuffer, documentName);
    console.log(`[mail] Document uploaded: ${documentId}`);

    // Step 3: Upload recipient address
    const mailAddress: Click2MailAddress = {
      organization: (creditorAddress.name as string) || (creditorAddress.department as string) || creditorName,
      address1: creditorAddress.address as string,
      address2: (creditorAddress.department as string) || "",
      city: creditorAddress.city as string,
      state: creditorAddress.state as string,
      zip: creditorAddress.zip as string,
    };
    console.log(`[mail] Step 3: Uploading address for "${mailAddress.organization}"...`);
    const addressId = await uploadAddressList(mailAddress);
    console.log(`[mail] Address uploaded: ${addressId}`);

    // Step 4: Create and submit the mail job
    console.log("[mail] Step 4: Creating job...");
    const jobId = await createJob(documentId, addressId);
    console.log(`[mail] Job created: ${jobId}, submitting...`);
    await submitJob(jobId);
    console.log("[mail] Job submitted successfully");

    // Step 5: Update Firestore with mail metadata
    const now = new Date().toISOString();
    await firestore.updateDoc(COLLECTIONS.disputes, disputeId, {
      mailJobId: jobId,
      mailDocumentId: documentId,
      mailAddressId: addressId,
      mailStatus: "SUBMITTED",
      mailedAt: now,
      status: "SENT",
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      mailJobId: jobId,
      mailStatus: "SUBMITTED",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    console.error("Mail dispatch failed:", errorMsg);

    // Record the error in Firestore so the user can see what went wrong
    try {
      await firestore.updateDoc(COLLECTIONS.disputes, disputeId, {
        mailStatus: "ERROR",
        mailError: error instanceof Error ? error.message : String(error),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Don't fail the response if error recording fails
    }

    return NextResponse.json(
      { error: "Failed to mail letter", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
