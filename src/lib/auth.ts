import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: "tourist" | "merchant" | "admin";
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" });
}

export function verifySession(token: string) {
  return jwt.verify(token, JWT_SECRET as string) as SessionPayload;
}
