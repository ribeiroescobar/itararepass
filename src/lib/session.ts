import "server-only";
import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "./auth";

// Single cookie for app sessions (JWT).
const SESSION_COOKIE = "itarare_session";

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

// Reads and verifies the session cookie. Returns null when missing/invalid.
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifySession(token);
  } catch {
    return null;
  }
}
