import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let code: string;
  try {
    const body = await request.json();
    code = String(body.code || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const userDoc = await firestore.getDoc(COLLECTIONS.users, user.uid);
  const storedHash = userDoc.data.twoFactorCode as string | null;
  const expiry = userDoc.data.twoFactorCodeExpiry as string | null;

  if (!storedHash || !expiry) {
    return NextResponse.json({ error: "No pending OTP. Request a new code." }, { status: 400 });
  }

  if (new Date(expiry).getTime() < Date.now()) {
    return NextResponse.json({ error: "Code has expired. Request a new one." }, { status: 400 });
  }

  // Hash the submitted code and compare
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(code));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  if (hashHex !== storedHash) {
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  // Clear the OTP from Firestore
  await firestore.updateDoc(COLLECTIONS.users, user.uid, {
    twoFactorCode: null,
    twoFactorCodeExpiry: null,
  });

  return NextResponse.json({ verified: true });
}
