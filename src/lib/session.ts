import "server-only";
import { cookies } from "next/headers";
import { verifySession, type SessionPayload } from "./auth";

const SESSION_COOKIE = "itarare_session";

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionFromCookies(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifySession(token);
  } catch {
    return null;
  }
}
