import { NextRequest, NextResponse } from "next/server";
import { getUserForAuth } from "@/lib/dynamodb";
import { firestore } from "@/lib/firebase-admin";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserForAuth(email);

    // Always return success to avoid revealing whether an email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await firestore.updateDoc("users", user.uid, {
      resetToken: token,
      resetTokenExpiry: expiry,
    });

    const resetUrl = `https://credit-800.com/reset-password?token=${token}&uid=${user.uid}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
