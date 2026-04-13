import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHmac, timingSafeEqual } from "node:crypto";

// Reads the session secret lazily so builds can succeed before runtime env is injected.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

// Minimum data required to rehydrate a session from the cookie.
export type SessionPayload = {
  sub: string;
  email: string;
  role: "tourist" | "merchant" | "admin";
};

type CompactCouponValidationPayload = {
  s: string;
  c: string;
  e: string;
  x: string;
};

export type CouponValidationPayload = {
  sub: string;
  couponId: string;
  establishmentId: string;
};

function toCompactUuid(uuid: string) {
  const normalized = uuid.replace(/-/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(normalized)) {
    throw new Error("Invalid UUID");
  }
  return Buffer.from(normalized, "hex").toString("base64url");
}

function fromCompactUuid(value: string) {
  const hex = Buffer.from(value, "base64url").toString("hex");
  if (hex.length !== 32) {
    throw new Error("Invalid compact UUID");
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function signCouponParts(parts: CompactCouponValidationPayload) {
  const payload = `${parts.s}.${parts.c}.${parts.e}.${parts.x}`;
  return createHmac("sha256", getJwtSecret()).update(payload).digest("base64url").slice(0, 22);
}

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
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

// Decode and verify the session token.
export function verifySession(token: string) {
  return jwt.verify(token, getJwtSecret()) as SessionPayload;
}

// Issues a short-lived token to validate a coupon on site.
export function signCouponValidationToken(payload: Omit<CouponValidationPayload, "type">) {
  const compactPayload: CompactCouponValidationPayload = {
    s: toCompactUuid(payload.sub),
    c: toCompactUuid(payload.couponId),
    e: toCompactUuid(payload.establishmentId),
    x: (Math.floor(Date.now() / 1000) + 60 * 10).toString(36),
  };
  const signature = signCouponParts(compactPayload);
  return `cv.${compactPayload.s}.${compactPayload.c}.${compactPayload.e}.${compactPayload.x}.${signature}`;
}

// Verifies the coupon validation token scanned by the merchant.
export function verifyCouponValidationToken(token: string) {
  const [version, s, c, e, x, signature] = token.split(".");
  if (version !== "cv" || !s || !c || !e || !x || !signature) {
    throw new Error("Invalid coupon token");
  }

  const expectedSignature = signCouponParts({ s, c, e, x });
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new Error("Invalid coupon signature");
  }

  const expiresAt = parseInt(x, 36);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    throw new Error("Expired coupon token");
  }

  return {
    sub: fromCompactUuid(s),
    couponId: fromCompactUuid(c),
    establishmentId: fromCompactUuid(e),
  };
}
