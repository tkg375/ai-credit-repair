import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let enabled: boolean;
  try {
    const body = await request.json();
    enabled = Boolean(body.enabled);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  await firestore.updateDoc(COLLECTIONS.users, user.uid, {
    twoFactorEnabled: enabled,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ twoFactorEnabled: enabled });
}
