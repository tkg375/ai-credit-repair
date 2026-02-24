import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { sendIssueReport } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { issue, page } = await req.json();
  if (!issue?.trim()) return NextResponse.json({ error: "Issue description is required" }, { status: 400 });

  await sendIssueReport({
    userId: user.uid,
    userEmail: user.email || "unknown",
    issue: issue.trim(),
    page,
  });

  return NextResponse.json({ success: true });
}
