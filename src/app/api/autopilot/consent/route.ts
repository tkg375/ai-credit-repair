import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription";
import {
  recordConsent,
  getValidConsent,
  revokeConsent,
  CONSENT_TEXT,
  CONSENT_VERSION,
} from "@/lib/fcra-consent";
import { logAuditEvent } from "@/lib/audit-log";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** GET /api/autopilot/consent — Returns current consent status */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const consent = await getValidConsent(user.uid);

  return NextResponse.json({
    hasValidConsent: !!consent,
    consentVersion: CONSENT_VERSION,
    consentedAt: consent?.consentedAt || null,
    currentConsentText: CONSENT_TEXT,
    currentConsentVersion: CONSENT_VERSION,
  });
}

/**
 * POST /api/autopilot/consent — Record FCRA consent
 * Body: { agreedToText: true, consentVersion: "1.0" }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await getUserSubscription(user.uid);
  if (!sub.isAutopilot) {
    return NextResponse.json(
      { error: "Autopilot subscription required to provide consent" },
      { status: 403 }
    );
  }

  let body: { agreedToText?: boolean; consentVersion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Require explicit agreement to the current consent text version
  if (!body.agreedToText) {
    return NextResponse.json(
      { error: "You must explicitly agree to the authorization text" },
      { status: 400 }
    );
  }

  if (body.consentVersion !== CONSENT_VERSION) {
    return NextResponse.json(
      {
        error: "Consent version mismatch. Please reload the page to see the latest authorization text.",
        currentVersion: CONSENT_VERSION,
      },
      { status: 409 }
    );
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";

  const consentId = await recordConsent({ userId: user.uid, ip, userAgent });

  await logAuditEvent({
    userId: user.uid,
    action: "autopilot_consent_given",
    resourceId: consentId,
    metadata: { consentVersion: CONSENT_VERSION, ip, userAgent },
    ip,
    userAgent,
  });

  return NextResponse.json({ success: true, consentId });
}

/**
 * DELETE /api/autopilot/consent — Revoke FCRA consent
 * Body: { consentId: string }
 */
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { consentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.consentId) {
    return NextResponse.json({ error: "consentId is required" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    await revokeConsent(user.uid, body.consentId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to revoke consent" },
      { status: 400 }
    );
  }

  await logAuditEvent({
    userId: user.uid,
    action: "autopilot_consent_revoked",
    resourceId: body.consentId,
    metadata: { ip },
    ip,
    userAgent,
  });

  return NextResponse.json({ success: true });
}
