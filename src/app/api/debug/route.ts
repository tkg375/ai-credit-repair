import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "set" : "missing",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "set" : "missing",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "missing",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : "missing",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "set" : "missing",
      S3_REGION: process.env.S3_REGION ? "set" : "missing",
      S3_BUCKET: process.env.S3_BUCKET ? "set" : "missing",
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ? "set" : "missing",
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ? "set" : "missing",
      LAMBDA_FUNCTION_NAME: process.env.LAMBDA_FUNCTION_NAME ? "set" : "missing",
    },
    projectId: (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NONE").trim(),
    timestamp: new Date().toISOString(),
  });
}
