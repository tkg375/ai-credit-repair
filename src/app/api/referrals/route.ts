import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore } from "@/lib/firebase-admin";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "C800-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Find existing referral record
    const referrals = await firestore.query("referrals", [
      { field: "referrerId", op: "EQUAL", value: user.uid },
    ]);

    if (referrals.length > 0) {
      return NextResponse.json({ referral: { id: referrals[0].id, ...referrals[0].data } });
    }

    // Create new referral record
    const code = generateCode();
    const docId = await firestore.addDoc("referrals", {
      referrerId: user.uid,
      referralCode: code,
      referredUsers: [],
      rewards: 0,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      referral: {
        id: docId,
        referrerId: user.uid,
        referralCode: code,
        referredUsers: [],
        rewards: 0,
      },
    });
  } catch (error) {
    console.error("Failed to get referral:", error);
    return NextResponse.json({ error: "Failed to get referral" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Track a referral (called during registration)
  try {
    const { referralCode, newUserId } = await req.json();

    if (!referralCode || !newUserId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find the referral by code
    const referrals = await firestore.query("referrals", [
      { field: "referralCode", op: "EQUAL", value: referralCode },
    ]);

    if (referrals.length === 0) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    const referral = referrals[0];
    const existingUsers = (referral.data.referredUsers as string[]) || [];

    // Don't add duplicate
    if (existingUsers.includes(newUserId)) {
      return NextResponse.json({ success: true, alreadyReferred: true });
    }

    // Update referral record
    await firestore.updateDoc("referrals", referral.id, {
      referredUsers: [...existingUsers, newUserId],
      rewards: (referral.data.rewards as number || 0) + 1,
    });

    // Mark the new user as referred
    await firestore.updateDoc("users", newUserId, {
      referredBy: referralCode,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to track referral:", error);
    return NextResponse.json({ error: "Failed to track referral" }, { status: 500 });
  }
}
