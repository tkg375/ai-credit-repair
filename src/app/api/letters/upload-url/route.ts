import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUploadUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileName, mimeType } = await req.json();
    const timestamp = Date.now();
    const s3Key = `reports/${user.uid}/letters/${timestamp}-${fileName}`;
    const uploadUrl = await getUploadUrl(s3Key, mimeType || "application/pdf");
    return NextResponse.json({ uploadUrl, s3Key });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
