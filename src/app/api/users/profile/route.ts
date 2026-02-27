import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, dateOfBirth, address, address2, city, state, zip, phone } = body;

  if (!fullName || !dateOfBirth || !address || !city || !state || !zip) {
    return NextResponse.json(
      { error: "fullName, dateOfBirth, address, city, state, and zip are required" },
      { status: 400 }
    );
  }

  const profileData = {
    fullName,
    dateOfBirth,
    address,
    address2: address2 || "",
    city,
    state,
    zip,
    phone: phone || "",
    email: user.email || "",
    updatedAt: new Date().toISOString(),
  };

  // Use setDoc (upsert) — creates or overwrites the user document
  await firestore.setDoc(COLLECTIONS.users, user.uid, profileData);

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["monthlyIncome", "fullName", "dateOfBirth", "address", "address2", "city", "state", "zip", "phone"];
  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  await firestore.updateDoc(COLLECTIONS.users, user.uid, updates);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await firestore.getDoc(COLLECTIONS.users, user.uid);
  if (!doc.exists) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: doc.data });
}
