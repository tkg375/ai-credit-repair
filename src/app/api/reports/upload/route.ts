import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { putObject } from "@/lib/s3";

// Allow larger file uploads and longer execution
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bureau = (formData.get("bureau") as string) || "UNKNOWN";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Upload to S3
    const timestamp = Date.now();
    const s3Key = `reports/${user.uid}/${timestamp}-${file.name}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await putObject(s3Key, bytes, "application/pdf");

    // Create credit report record in Firestore
    const reportId = await firestore.addDoc(COLLECTIONS.creditReports, {
      userId: user.uid,
      fileName: file.name,
      s3Key,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: "UPLOADED",
      bureau,
    });

    return NextResponse.json({
      success: true,
      reportId,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file", details: String(err) },
      { status: 500 }
    );
  }
}
