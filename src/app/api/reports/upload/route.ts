import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { put } from "@vercel/blob";

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

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const filename = `${user.uid}/${timestamp}-${file.name}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: "application/pdf",
    });

    // Create credit report record in Firestore
    const reportId = await firestore.addDoc(COLLECTIONS.creditReports, {
      userId: user.uid,
      fileName: file.name,
      blobUrl: blob.url,
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
