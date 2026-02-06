import { cookies, headers } from "next/headers";
import { verifyIdToken, getLastVerifyError } from "./firebase-admin";

// Store last auth error for debugging
let lastAuthError = "";

export function getLastAuthError(): string {
  return lastAuthError;
}

export async function getAuthUser(): Promise<{
  uid: string;
  email: string;
} | null> {
  lastAuthError = "";

  // First check Authorization header
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await verifyIdToken(token);
    if (user) return user;
    lastAuthError = getLastVerifyError() || "token verification failed";
    return null;
  }

  // Fall back to cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("firebase-token")?.value;

  if (!token) {
    lastAuthError = "no token in header or cookie";
    return null;
  }

  const user = await verifyIdToken(token);
  if (!user) {
    lastAuthError = getLastVerifyError() || "cookie token verification failed";
  }
  return user;
}
