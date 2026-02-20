import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? "";

  // Process the key the same way firebase-admin.ts does
  const afterNewlineReplace = raw.replace(/\\n/g, "\n");
  const pemBody = afterNewlineReplace
    .replace(/[^A-Za-z0-9+/=]/g, "")
    .replace(/^BEGIN(RSA|EC)?PRIVATEKEY/, "")
    .replace(/END(RSA|EC)?PRIVATEKEY$/, "");

  // Try to decode and import to get the real error
  let keyDiag: Record<string, unknown> = {
    rawLength: raw.length,
    pemBodyLength: pemBody.length,
    pemBodyMod4: pemBody.length % 4,
    startsWithBegin: raw.includes("-----BEGIN PRIVATE KEY-----"),
    hasLiteralBackslashN: raw.includes("\\n"),
    hasActualNewline: raw.includes("\n"),
    first30: pemBody.slice(0, 30),
    last10: pemBody.slice(-10),
  };

  try {
    const binary = atob(pemBody);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    keyDiag.decodedBytes = bytes.length;
    keyDiag.firstBytesHex = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, "0")).join(" ");

    await crypto.subtle.importKey(
      "pkcs8", bytes.buffer as ArrayBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["sign"]
    );
    keyDiag.importResult = "SUCCESS";
  } catch (err) {
    keyDiag.importResult = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "set" : "missing",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "set" : "missing",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "missing",
      FIREBASE_PRIVATE_KEY: raw ? `set (${raw.length} chars)` : "missing",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "set" : "missing",
      S3_REGION: process.env.S3_REGION || "missing",
      S3_BUCKET: process.env.S3_BUCKET || "missing",
      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ? "set" : "missing",
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ? "set" : "missing",
      LAMBDA_FUNCTION_NAME: process.env.LAMBDA_FUNCTION_NAME ? "set" : "missing",
    },
    keyDiag,
    projectId: (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NONE").trim(),
    timestamp: new Date().toISOString(),
  });
}
