import { NextResponse } from "next/server";

/**
 * Two-factor authentication is mandatory for all users and cannot be disabled.
 * This endpoint is intentionally locked down to prevent any bypass.
 */
export async function PATCH() {
  return NextResponse.json(
    {
      error: "Two-factor authentication is required for all accounts and cannot be disabled.",
      twoFactorEnabled: true,
    },
    { status: 403 }
  );
}
