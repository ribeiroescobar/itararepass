"use client";

export type CachedTouristAuth = {
  user: { uid: string; email: string };
  profile: unknown;
  cachedAt: number;
};

export type PendingOfflineCheckIn = {
  id: string;
  spotId: string;
  token: string;
  insight: string;
  language: string;
  scannedAt: number;
  spotName?: string;
  location?: { lat: number; lng: number } | null;
  demoMode?: boolean;
};

const AUTH_CACHE_KEY = "itarare_auth_tourist_cache_v1";
const BASE_SPOTS_CACHE_KEY = "itarare_spots_cache_v1";
const BASE_COUPONS_CACHE_KEY = "itarare_coupons_cache_v1";

function safeRead<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

function userScopedKey(userKey: string, suffix: string) {
  return `itarare_${suffix}_${userKey}`;
}

export function buildOfflineUserKey(userLike?: { uid?: string; email?: string; id?: string } | null) {
  if (!userLike) return "";
  return userLike.uid || userLike.id || userLike.email || "";
}

export function readCachedTouristAuth() {
  return safeRead<CachedTouristAuth>(AUTH_CACHE_KEY);
}

export function writeCachedTouristAuth(value: CachedTouristAuth) {
  safeWrite(AUTH_CACHE_KEY, value);
}

export function clearCachedTouristAuth() {
  safeRemove(AUTH_CACHE_KEY);
}

export function readCachedBaseSpots<T>() {
  return safeRead<T[]>(BASE_SPOTS_CACHE_KEY) || [];
}

export function writeCachedBaseSpots<T>(spots: T[]) {
  safeWrite(BASE_SPOTS_CACHE_KEY, spots);
}

export function readCachedBaseCoupons<T>() {
  return safeRead<T[]>(BASE_COUPONS_CACHE_KEY) || [];
}

export function writeCachedBaseCoupons<T>(coupons: T[]) {
  safeWrite(BASE_COUPONS_CACHE_KEY, coupons);
}

export function readCachedUserCheckins<T>(userKey: string) {
  if (!userKey) return [] as T[];
  return safeRead<T[]>(userScopedKey(userKey, "checkins_cache_v1")) || [];
}

export function writeCachedUserCheckins<T>(userKey: string, checkins: T[]) {
  if (!userKey) return;
  safeWrite(userScopedKey(userKey, "checkins_cache_v1"), checkins);
}

export function readCachedUserCoupons<T>(userKey: string) {
  if (!userKey) return [] as T[];
  return safeRead<T[]>(userScopedKey(userKey, "user_coupons_cache_v1")) || [];
}

export function writeCachedUserCoupons<T>(userKey: string, coupons: T[]) {
  if (!userKey) return;
  safeWrite(userScopedKey(userKey, "user_coupons_cache_v1"), coupons);
}

export function readPendingOfflineCheckins(userKey: string) {
  if (!userKey) return [] as PendingOfflineCheckIn[];
  return safeRead<PendingOfflineCheckIn[]>(userScopedKey(userKey, "pending_checkins_v1")) || [];
}

export function writePendingOfflineCheckins(userKey: string, queue: PendingOfflineCheckIn[]) {
  if (!userKey) return;
  safeWrite(userScopedKey(userKey, "pending_checkins_v1"), queue);
}

export function createPendingOfflineCheckInId() {
  return `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
