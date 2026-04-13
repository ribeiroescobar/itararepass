import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Shared secret used to sign/verify session JWTs. Must be set in production.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

// Minimum data required to rehydrate a session from the cookie.
export type SessionPayload = {
  sub: string;
  email: string;
  role: "tourist" | "merchant" | "admin";
};

// Hash a raw password before storing it in the database.
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Compare a raw password to a stored hash.
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Issue a signed JWT for the session cookie.
export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" });
}

// Decode and verify the session token.
export function verifySession(token: string) {
  return jwt.verify(token, JWT_SECRET as string) as SessionPayload;
}
