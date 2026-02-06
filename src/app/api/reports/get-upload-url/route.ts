import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max
          tokenPayload: JSON.stringify({
            userId: user.uid,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs after upload completes
        console.log("Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
