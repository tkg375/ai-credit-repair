import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "set" : "missing",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "set" : "missing",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "missing",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : "missing",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "set" : "missing",
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? "set" : "missing",
    },
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NONE",
  });
}
