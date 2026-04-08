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

  const t = useCallback(
    (key: string) => {
      return (TRANSLATIONS[language] as any)[key] || key;
    },
    [language]
  );

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

  const spots = useMemo(() => {
    return INITIAL_SPOTS.map((spot) => {
      const visit = userCheckins?.find((c) => c.spotId === spot.id);
      return {
        ...spot,
        name: t(`${spot.id}_name`),
        visited: !!visit,
        historicalSnippet: visit?.insight || t(`${spot.id}_snippet`),
        insightLanguage: visit?.language || "pt",
        userRating: visit?.rating || 0,
      };
    });
  }, [userCheckins, language, t]);

  const coupons = useMemo(() => {
    const adventureVisitedCount = spots.filter((s) => s.type === "adventure" && s.visited).length;
    const lodgingVisited = spots.some((s) => s.type === "lodging" && s.visited);
    const profileCompleted = !!profile?.completed;

    return INITIAL_COUPONS.map((coupon) => {
      const isUsed = userCoupons?.some((uc) => uc.id === coupon.id && uc.used);

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
        statusLabel = unlocked
          ? t("mission_unlocked")
          : t("missing_points").replace("{count}", (coupon.minAdventureSpots - adventureVisitedCount).toString());
      }

      return {
        ...coupon,
        businessName: t(`${coupon.id}_name`),
        address: t(`${coupon.id}_addr`),
        discount: t(`${coupon.id}_discount`),
        used: !!isUsed,
        locked: !unlocked,
        requirementLabel: reqLabel,
        statusLabel: statusLabel,
      };
    });
  }, [spots, userCoupons, profile?.completed, language, t]);

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
    const spot = INITIAL_SPOTS.find((s) => s.id === spotId);
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
