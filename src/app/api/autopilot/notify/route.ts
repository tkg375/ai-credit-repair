import { NextRequest, NextResponse } from "next/server";
import { firestore, COLLECTIONS } from "@/lib/db";
import { sendAutopilotNotifyEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Check for duplicate
    const existing = await firestore.query(COLLECTIONS.autopilotWaitlist, [
      { field: "email", op: "EQUAL", value: normalized },
    ]);

    if (existing.length > 0) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    await firestore.addDoc(COLLECTIONS.autopilotWaitlist, {
      email: normalized,
      signedUpAt: new Date().toISOString(),
    });

    await sendAutopilotNotifyEmail(normalized);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[autopilot/notify]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
