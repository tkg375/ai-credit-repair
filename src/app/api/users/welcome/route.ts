import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || !user.email) return NextResponse.json({ ok: false });
  const { name } = await req.json().catch(() => ({ name: "" }));
  sendWelcomeEmail(user.email, name || "").catch(() => {});
  return NextResponse.json({ ok: true });
}
