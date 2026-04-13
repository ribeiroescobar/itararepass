"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { INITIAL_SPOTS, INITIAL_COUPONS, TRANSLATIONS, Language, SpotType } from "@/lib/constants";
import { useItarareAuth } from "./use-auth";

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
}

export interface Coupon {
  id: string;
  title?: string;
  businessName: string;
  address: string;
  discount: string;
  used: boolean;
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

interface BusinessContextType {
  spots: TouristSpot[];
  coupons: Coupon[];
  language: Language;
  setLanguage: (lang: Language) => void;
  checkIn: (spotId: string, insight?: string, lang?: string) => Promise<void>;
  rateSpot: (spotId: string, rating: number) => Promise<void>;
  useCoupon: (id: string) => Promise<void>;
  addComment: (spotId: string, text: string, photo?: string, rating?: number) => Promise<void>;
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

  const t = useCallback(
    (key: string) => {
      return (TRANSLATIONS[language] as any)[key] || key;
    },
    [language]
  );

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

  useEffect(() => {
    let active = true;
    if (!user) {
      setUserCheckins([]);
      setUserCoupons([]);
      return;
    }

    fetchJson<{ checkins: any[] }>("/api/checkins")
      .then((data) => {
        if (!active) return;
        setUserCheckins(data.checkins || []);
      })
      .catch(() => {
        if (!active) return;
        setUserCheckins([]);
      });

    fetchJson<{ coupons: any[] }>("/api/coupons")
      .then((data) => {
        if (!active) return;
        setUserCoupons(data.coupons || []);
      })
      .catch(() => {
        if (!active) return;
        setUserCoupons([]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const fetchBaseData = useCallback(() => {
    fetchJson<{ spots: ApiSpot[] }>("/api/spots")
      .then((data) => {
        setBaseSpots(data.spots || []);
      })
      .catch(() => {
        setBaseSpots([]);
      });

    fetchJson<{ coupons: ApiCoupon[] }>("/api/coupons/catalog")
      .then((data) => {
        setBaseCoupons(data.coupons || []);
      })
      .catch(() => {
        setBaseCoupons([]);
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

  const spots = useMemo(() => {
    const sourceSpots = uniqueById<ApiSpot>((baseSpots.length > 0 ? baseSpots : INITIAL_SPOTS) as ApiSpot[]);
    return sourceSpots.map((spot) => {
      const visit = userCheckins?.find((c) => c.spotId === spot.id);
      return {
        ...spot,
        image: spot.image || "",
        name: translateOrFallback(`${spot.id}_name`, spot.name),
        visited: !!visit,
        historicalSnippet: visit?.insight || translateOrFallback(`${spot.id}_snippet`, spot.historicalSnippet),
        insightLanguage: visit?.language || "pt",
        userRating: visit?.rating || 0,
      };
    });
  }, [userCheckins, language, t, baseSpots, translateOrFallback, uniqueById]);

  const coupons = useMemo(() => {
    const adventureVisitedCount = spots.filter((s) => s.type === "adventure" && s.visited).length;
    const lodgingVisited = spots.some((s) => s.type === "lodging" && s.visited);
    const profileCompleted = !!profile?.completed;

    const sourceCoupons = uniqueById<ApiCoupon>((baseCoupons.length > 0 ? baseCoupons : INITIAL_COUPONS) as ApiCoupon[]);
    return sourceCoupons.map((coupon) => {
      const isUsed = userCoupons?.some((uc) => uc.id === coupon.id && uc.used);
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
        used: !!isUsed,
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
    setUserCheckins(updated.checkins || []);
  };

  const rateSpot = async (spotId: string, rating: number) => {
    if (!user) return;
    await fetchJson("/api/checkins", {
      method: "POST",
      body: JSON.stringify({ spotId, rating }),
    });

    const updated = await fetchJson<{ checkins: any[] }>("/api/checkins");
    setUserCheckins(updated.checkins || []);
  };

  const useCoupon = async (couponId: string) => {
    if (!user) return;
    await fetchJson("/api/coupons/use", {
      method: "POST",
      body: JSON.stringify({ couponId }),
    });

    const updated = await fetchJson<{ coupons: any[] }>("/api/coupons");
    setUserCoupons(updated.coupons || []);
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
      rateSpot,
      useCoupon,
      addComment,
      t,
    }),
    [spots, coupons, language, t]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useItarareBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) throw new Error("BusinessProvider Error");
  return context;
}
