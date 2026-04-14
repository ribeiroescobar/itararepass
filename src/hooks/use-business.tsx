"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { INITIAL_SPOTS, INITIAL_COUPONS, TRANSLATIONS, Language, SpotType } from "@/lib/constants";
import { useItarareAuth } from "./use-auth";
import {
  buildOfflineUserKey,
  createPendingOfflineCheckInId,
  PendingOfflineCheckIn,
  readCachedBaseCoupons,
  readCachedBaseSpots,
  readCachedUserCheckins,
  readCachedUserCoupons,
  readPendingOfflineCheckins,
  writeCachedBaseCoupons,
  writeCachedBaseSpots,
  writeCachedUserCheckins,
  writeCachedUserCoupons,
  writePendingOfflineCheckins,
} from "@/lib/offline-cache";

export interface TouristSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visited: boolean;
  image: string;
  type: SpotType;
  historicalSnippet?: string;
  insightLanguage?: string;
  capacity: number;
  currentLoad: number;
  averageRating: number;
  userRating?: number;
  cityId: string;
  pendingSync?: boolean;
}

export interface Coupon {
  id: string;
  title?: string;
  businessName: string;
  address: string;
  discount: string;
  claimed?: boolean;
  used: boolean;
  usedAt?: string;
  image: string;
  locked?: boolean;
  requirementLabel?: string;
  statusLabel?: string;
  minAdventureSpots?: number;
  requiresLodging?: boolean;
  requiresProfile?: boolean;
  isPremium?: boolean;
  lat?: number;
  lng?: number;
  translationKey?: string;
}

export interface CouponClaimResult {
  token: string;
  alreadyClaimed: boolean;
  expiresInMinutes: number;
  coupon: {
    id: string;
    title: string;
    discount: string;
    businessName: string;
  };
}

interface BusinessContextType {
  spots: TouristSpot[];
  coupons: Coupon[];
  language: Language;
  setLanguage: (lang: Language) => void;
  checkIn: (spotId: string, insight?: string, lang?: string) => Promise<void>;
  registerOfflineCheckIn: (input: {
    spotId: string;
    token: string;
    insight: string;
    language: string;
    spotName?: string;
    location?: { lat: number; lng: number } | null;
    demoMode?: boolean;
  }) => Promise<void>;
  rateSpot: (spotId: string, rating: number) => Promise<void>;
  useCoupon: (id: string) => Promise<CouponClaimResult | undefined>;
  addComment: (spotId: string, text: string, photo?: string, rating?: number) => Promise<void>;
  refreshUserProgress: () => Promise<void>;
  pendingCheckinsCount: number;
  isOfflineMode: boolean;
  isSyncingPendingCheckins: boolean;
  t: (key: string) => string;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

type ApiSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: SpotType;
  image?: string;
  capacity: number;
  currentLoad: number;
  averageRating: number;
  cityId: string;
  historicalSnippet?: string;
};

type ApiCoupon = Coupon;

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveCouponTranslationKey(coupon: Partial<ApiCoupon>) {
  if (coupon.id?.startsWith("c_")) return coupon.id;

  const businessName = normalizeText(coupon.businessName);
  const title = normalizeText(coupon.title);
  const discount = normalizeText(coupon.discount);
  const haystack = `${businessName} ${title} ${discount}`;

  if (haystack.includes("casa do artesao") || haystack.includes("artisan house")) return "c_artesao";
  if (haystack.includes("cafe dona bela") || haystack.includes("dona bela cafe")) return "c_dona_bela";
  if (haystack.includes("padaria abati") || haystack.includes("abati bakery")) return "c_abati";
  if (haystack.includes("hotel itarare") || haystack.includes("itarare hotel")) return "c_hotel";
  if (haystack.includes("gourmeteria")) return "c_gourmeteria";

  return undefined;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || "Erro inesperado.";
    throw new Error(message);
  }
  return data as T;
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useItarareAuth();
  const [language, setLanguage] = useState<Language>("pt");
  const [userCheckins, setUserCheckins] = useState<any[]>([]);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [baseSpots, setBaseSpots] = useState<ApiSpot[]>([]);
  const [baseCoupons, setBaseCoupons] = useState<ApiCoupon[]>([]);
  const [pendingOfflineCheckins, setPendingOfflineCheckins] = useState<PendingOfflineCheckIn[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncingPendingCheckins, setIsSyncingPendingCheckins] = useState(false);

  const offlineUserKey = useMemo(
    () => buildOfflineUserKey({ uid: profile?.uid, email: profile?.email || user?.email, id: user?.uid }),
    [profile?.uid, profile?.email, user?.email, user?.uid]
  );

  const t = useCallback(
    (key: string) => {
      return (TRANSLATIONS[language] as any)[key] || key;
    },
    [language]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOnlineStatus = () => {
      setIsOfflineMode(!window.navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // Prefer translation keys when available, fallback to database/seed values.
  const translateOrFallback = useCallback(
    (key: string, fallback: string | undefined) => {
      const translated = t(key);
      return translated !== key ? translated : (fallback ?? key);
    },
    [t]
  );

  // Defensive dedupe to avoid repeated items from DB or seed.
  const uniqueById = useCallback(<T extends { id: string }>(items: T[]) => {
    const seen = new Set<string>();
    const result: T[] = [];
    for (const item of items) {
      if (!item?.id || seen.has(item.id)) continue;
      seen.add(item.id);
      result.push(item);
    }
    return result;
  }, []);

  const refreshUserProgress = useCallback(async () => {
    if (!user) {
      setUserCheckins([]);
      setUserCoupons([]);
      setPendingOfflineCheckins([]);
      return;
    }

    const cachedCheckins = readCachedUserCheckins<any>(offlineUserKey);
    const cachedCoupons = readCachedUserCoupons<any>(offlineUserKey);
    const cachedPending = readPendingOfflineCheckins(offlineUserKey);

    const [checkinsData, couponsData] = await Promise.all([
      fetchJson<{ checkins: any[] }>("/api/checkins").catch(() => ({ checkins: cachedCheckins })),
      fetchJson<{ coupons: any[] }>("/api/coupons").catch(() => ({ coupons: cachedCoupons })),
    ]);

    const nextCheckins = checkinsData.checkins || [];
    const nextCoupons = couponsData.coupons || [];
    const nextPending = cachedPending.filter(
      (item) => !nextCheckins.some((checkin) => checkin.spotId === item.spotId)
    );

    setUserCheckins(nextCheckins);
    setUserCoupons(nextCoupons);
    setPendingOfflineCheckins(nextPending);
    writeCachedUserCheckins(offlineUserKey, nextCheckins);
    writeCachedUserCoupons(offlineUserKey, nextCoupons);
    writePendingOfflineCheckins(offlineUserKey, nextPending);
  }, [user, offlineUserKey]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setUserCheckins([]);
      setUserCoupons([]);
      setPendingOfflineCheckins([]);
      return;
    }

    setUserCheckins(readCachedUserCheckins<any>(offlineUserKey));
    setUserCoupons(readCachedUserCoupons<any>(offlineUserKey));
    setPendingOfflineCheckins(readPendingOfflineCheckins(offlineUserKey));

    refreshUserProgress().catch(() => {
      if (!active) return;
      setUserCheckins(readCachedUserCheckins<any>(offlineUserKey));
      setUserCoupons(readCachedUserCoupons<any>(offlineUserKey));
      setPendingOfflineCheckins(readPendingOfflineCheckins(offlineUserKey));
    });

    const handleFocus = () => {
      void refreshUserProgress();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }

    return () => {
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [user, offlineUserKey, refreshUserProgress]);

  const fetchBaseData = useCallback(() => {
    fetchJson<{ spots: ApiSpot[] }>("/api/spots")
      .then((data) => {
        const nextSpots = data.spots || [];
        setBaseSpots(nextSpots);
        writeCachedBaseSpots(nextSpots);
      })
      .catch(() => {
        const cachedSpots = readCachedBaseSpots<ApiSpot>();
        setBaseSpots(cachedSpots);
      });

    fetchJson<{ coupons: ApiCoupon[] }>("/api/coupons/catalog")
      .then((data) => {
        const nextCoupons = data.coupons || [];
        setBaseCoupons(nextCoupons);
        writeCachedBaseCoupons(nextCoupons);
      })
      .catch(() => {
        const cachedCoupons = readCachedBaseCoupons<ApiCoupon>();
        setBaseCoupons(cachedCoupons);
      });
  }, []);

  useEffect(() => {
    fetchBaseData();
    const handleFocus = () => fetchBaseData();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
      }
    };
  }, [fetchBaseData]);

  const registerOfflineCheckIn = useCallback(
    async (input: {
      spotId: string;
      token: string;
      insight: string;
      language: string;
      spotName?: string;
      location?: { lat: number; lng: number } | null;
      demoMode?: boolean;
    }) => {
      if (!user || !offlineUserKey) return;

      const nextQueue = [
        ...pendingOfflineCheckins.filter((item) => item.spotId !== input.spotId),
        {
          id: createPendingOfflineCheckInId(),
          spotId: input.spotId,
          token: input.token,
          insight: input.insight,
          language: input.language,
          scannedAt: Date.now(),
          spotName: input.spotName,
          location: input.location ?? null,
          demoMode: !!input.demoMode,
        },
      ];

      setPendingOfflineCheckins(nextQueue);
      writePendingOfflineCheckins(offlineUserKey, nextQueue);
    },
    [offlineUserKey, pendingOfflineCheckins, user]
  );

  const syncPendingCheckins = useCallback(async () => {
    if (!user || !offlineUserKey || pendingOfflineCheckins.length === 0) return;
    if (typeof window !== "undefined" && !window.navigator.onLine) return;

    setIsSyncingPendingCheckins(true);
    let remainingQueue = [...pendingOfflineCheckins];
    let hasSyncedAny = false;

    for (const item of pendingOfflineCheckins) {
      try {
        if (!item.demoMode) {
          await fetchJson("/api/checkins/verify", {
            method: "POST",
            body: JSON.stringify({ token: item.token, spotId: item.spotId }),
          });
        }

        await fetchJson("/api/checkins", {
          method: "POST",
          body: JSON.stringify({
            spotId: item.spotId,
            insight: item.insight || "",
            language: item.language || "pt",
          }),
        });

        remainingQueue = remainingQueue.filter((queued) => queued.spotId !== item.spotId);
        hasSyncedAny = true;
      } catch {
        continue;
      }
    }

    setPendingOfflineCheckins(remainingQueue);
    writePendingOfflineCheckins(offlineUserKey, remainingQueue);

    if (hasSyncedAny) {
      await refreshUserProgress().catch(() => undefined);
    }

    setIsSyncingPendingCheckins(false);
  }, [offlineUserKey, pendingOfflineCheckins, refreshUserProgress, user]);

  useEffect(() => {
    void syncPendingCheckins();
  }, [syncPendingCheckins]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => {
      void syncPendingCheckins();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncPendingCheckins]);

  const spots = useMemo(() => {
    const sourceSpots = uniqueById<ApiSpot>((baseSpots.length > 0 ? baseSpots : INITIAL_SPOTS) as ApiSpot[]);
    const pendingBySpotId = new Map(pendingOfflineCheckins.map((item) => [item.spotId, item]));

    return sourceSpots.map((spot) => {
      const visit = userCheckins?.find((c) => c.spotId === spot.id);
      const pending = pendingBySpotId.get(spot.id);
      return {
        ...spot,
        image: spot.image || "",
        name: translateOrFallback(`${spot.id}_name`, spot.name),
        visited: !!visit,
        pendingSync: !visit && !!pending,
        historicalSnippet:
          visit?.insight || pending?.insight || translateOrFallback(`${spot.id}_snippet`, spot.historicalSnippet),
        insightLanguage: visit?.language || pending?.language || "pt",
        userRating: visit?.rating || 0,
      };
    });
  }, [userCheckins, baseSpots, translateOrFallback, uniqueById, pendingOfflineCheckins]);

  const coupons = useMemo(() => {
    const adventureVisitedCount = spots.filter((s) => s.type === "adventure" && s.visited).length;
    const lodgingVisited = spots.some((s) => s.type === "lodging" && s.visited);
    const profileCompleted = !!profile?.completed;

    const sourceCoupons = uniqueById<ApiCoupon>((baseCoupons.length > 0 ? baseCoupons : INITIAL_COUPONS) as ApiCoupon[]);
    return sourceCoupons.map((coupon) => {
      const userCoupon = userCoupons?.find((uc) => uc.id === coupon.id);
      const isClaimed = !!userCoupon;
      const isUsed = !!userCoupon?.used;
      const translationKey = resolveCouponTranslationKey(coupon);

      let unlocked = true;
      let reqLabel = "";
      let statusLabel = "";

      if (coupon.requiresProfile) {
        unlocked = profileCompleted;
        reqLabel = t("rule_profile");
        statusLabel = unlocked ? t("mission_unlocked") : t("locked");
      } else if (coupon.requiresLodging) {
        unlocked = lodgingVisited;
        reqLabel = t("rule_lodging");
        statusLabel = unlocked ? t("mission_unlocked") : t("locked");
      } else if (coupon.minAdventureSpots) {
        unlocked = adventureVisitedCount >= coupon.minAdventureSpots;
        reqLabel = t(`rule_${coupon.minAdventureSpots}_adventure`);
        const missingVisits = coupon.minAdventureSpots - adventureVisitedCount;
        statusLabel = unlocked
          ? t("mission_unlocked")
          : t(missingVisits > 1 ? "missing_points_plural" : "missing_points").replace("{count}", missingVisits.toString());
      }

      return {
        ...coupon,
        title: translationKey ? translateOrFallback(`${translationKey}_title`, coupon.title) : coupon.title,
        businessName: translationKey ? translateOrFallback(`${translationKey}_name`, coupon.businessName) : coupon.businessName,
        address: translationKey ? translateOrFallback(`${translationKey}_addr`, coupon.address) : coupon.address,
        discount: translationKey ? translateOrFallback(`${translationKey}_discount`, coupon.discount) : coupon.discount,
        image: coupon.image || (coupon as any).businessImage || coupon.image,
        claimed: isClaimed,
        used: !!isUsed,
        usedAt: userCoupon?.usedAt,
        locked: !unlocked,
        requirementLabel: reqLabel,
        statusLabel: statusLabel,
        translationKey,
      };
    });
  }, [spots, userCoupons, profile?.completed, language, t, baseCoupons, translateOrFallback, uniqueById]);

  const checkIn = async (spotId: string, insight?: string, lang?: string) => {
    if (!user) return;
    await fetchJson("/api/checkins", {
      method: "POST",
      body: JSON.stringify({
        spotId,
        insight: insight || "",
        language: lang || "pt",
      }),
    });

    const updated = await fetchJson<{ checkins: any[] }>("/api/checkins");
    const nextCheckins = updated.checkins || [];
    setUserCheckins(nextCheckins);
    writeCachedUserCheckins(offlineUserKey, nextCheckins);
  };

  const rateSpot = async (spotId: string, rating: number) => {
    if (!user) return;
    await fetchJson("/api/checkins", {
      method: "POST",
      body: JSON.stringify({ spotId, rating }),
    });

    const updated = await fetchJson<{ checkins: any[] }>("/api/checkins");
    const nextCheckins = updated.checkins || [];
    setUserCheckins(nextCheckins);
    writeCachedUserCheckins(offlineUserKey, nextCheckins);
  };

  const useCoupon = async (couponId: string) => {
    if (!user) return;
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      throw new Error("Internet necessaria para gerar o QR do beneficio.");
    }
    const result = await fetchJson<CouponClaimResult>("/api/coupons/use", {
      method: "POST",
      body: JSON.stringify({ couponId }),
    });

    const updated = await fetchJson<{ coupons: any[] }>("/api/coupons");
    const nextCoupons = updated.coupons || [];
    setUserCoupons(nextCoupons);
    writeCachedUserCoupons(offlineUserKey, nextCoupons);
    return result;
  };

  const addComment = async (spotId: string, text: string, photo?: string, rating?: number) => {
    if (!user) return;
    const sourceSpots = (baseSpots.length > 0 ? baseSpots : INITIAL_SPOTS) as ApiSpot[];
    const spot = sourceSpots.find((s) => s.id === spotId);
    await fetchJson("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        spotId,
        spotName: spot?.name || spotId,
        text,
        photo: photo || null,
        rating: rating || 0,
      }),
    });

    if (rating) {
      await rateSpot(spotId, rating);
    }
  };

  const value = useMemo(
    () => ({
      spots,
      coupons,
      language,
      setLanguage,
      checkIn,
      registerOfflineCheckIn,
      rateSpot,
      useCoupon,
      addComment,
      refreshUserProgress,
      pendingCheckinsCount: pendingOfflineCheckins.length,
      isOfflineMode,
      isSyncingPendingCheckins,
      t,
    }),
    [spots, coupons, language, t, refreshUserProgress, registerOfflineCheckIn, pendingOfflineCheckins.length, isOfflineMode, isSyncingPendingCheckins]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useItarareBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) throw new Error("BusinessProvider Error");
  return context;
}
