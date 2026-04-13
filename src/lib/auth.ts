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
  claimId?: string;
  sub?: string;
  couponId?: string;
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

function toUpperHexUuid(uuid: string) {
  const normalized = uuid.replace(/-/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(normalized)) {
    throw new Error("Invalid UUID");
  }
  return normalized.toUpperCase();
}

function fromUpperHexUuid(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!/^[0-9A-F]{32}$/.test(normalized)) {
    throw new Error("Invalid hex UUID");
  }
  return `${normalized.slice(0, 8)}-${normalized.slice(8, 12)}-${normalized.slice(12, 16)}-${normalized.slice(16, 20)}-${normalized.slice(20)}`.toLowerCase();
}

function signCouponPartsV2(parts: { u: string; e: string; x: string }) {
  const payload = `${parts.u}.${parts.e}.${parts.x}`;
  return createHmac("sha256", getJwtSecret()).update(payload).digest("hex").slice(0, 16).toUpperCase();
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
export function signCouponValidationToken(payload: { claimId: string; establishmentId: string }) {
  const compactPayload = {
    u: toUpperHexUuid(payload.claimId),
    e: toUpperHexUuid(payload.establishmentId),
    x: (Math.floor(Date.now() / 1000) + 60 * 30).toString(36).toUpperCase(),
  };
  const signature = signCouponPartsV2(compactPayload);
  return `CV.${compactPayload.u}.${compactPayload.e}.${compactPayload.x}.${signature}`;
}

// Verifies the coupon validation token scanned by the merchant.
export function verifyCouponValidationToken(token: string) {
  const normalizedToken = token.trim().replace(/\s+/g, "");
  const parts = normalizedToken.split(".");

  if (parts.length === 5) {
    const [version, u, e, x, signature] = parts;
    if (version.toUpperCase() !== "CV" || !u || !e || !x || !signature) {
      throw new Error("Invalid coupon token");
    }

    const expectedSignature = signCouponPartsV2({ u: u.toUpperCase(), e: e.toUpperCase(), x: x.toUpperCase() });
    if (signature.toUpperCase() !== expectedSignature) {
      throw new Error("Invalid coupon signature");
    }

    const expiresAt = parseInt(x, 36);
    if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new Error("Expired coupon token");
    }

    return {
      claimId: fromUpperHexUuid(u),
      establishmentId: fromUpperHexUuid(e),
    };
  }

  const [version, s, c, e, x, signature] = parts;
  if (version?.toLowerCase() !== "cv" || !s || !c || !e || !x || !signature) {
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
