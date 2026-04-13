"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coupon, useItarare } from "@/hooks/use-itarare";
import { Info, Lock, MapPin, Navigation, Sparkles, Tag, Target } from "lucide-react";

interface CouponCardProps {
  coupon: Coupon;
  onUse: (id: string) => void;
}

export function CouponCard({ coupon, onUse }: CouponCardProps) {
  const router = useRouter();
  const { startNavigation, t, language } = useItarare();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLocked = coupon.locked;

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (coupon.lat && coupon.lng) {
      startNavigation({
        id: coupon.id,
        name: coupon.businessName,
        lat: coupon.lat,
        lng: coupon.lng,
      });
      router.push("/map");
    }
  };

  return (
    <Card
      className={`relative flex flex-col overflow-hidden rounded-[2rem] border-none bg-[#1a2d24] shadow-2xl transition-all duration-300 ${
        coupon.used ? "opacity-40 grayscale" : "group hover:scale-[1.02]"
      }`}
    >
      <div className="absolute top-1/2 -left-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
      <div className="absolute top-1/2 -right-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />

      <div className="relative h-32 w-full">
        <Image
          src={coupon.image}
          alt={coupon.businessName}
          fill
          className={`object-cover transition-opacity ${isLocked ? "opacity-30" : "opacity-100"}`}
          data-ai-hint="restaurant food hotel"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2d24] via-black/10 to-transparent" />

        {mounted && isLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center text-white backdrop-blur-[3px]">
            <div className="mb-3 rounded-2xl border border-white/20 bg-primary p-3 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div className="mb-2 rounded-xl bg-white px-4 py-2 shadow-xl">
              <p className="text-[11px] font-black uppercase tracking-tight text-black">{coupon.requirementLabel}</p>
            </div>
            <div className="rounded-lg border border-white/30 bg-primary px-3 py-1 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">{coupon.statusLabel}</p>
            </div>
          </div>
        ) : mounted && !isLocked ? (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/20 bg-primary/90 px-3 py-1.5 text-[10px] font-black text-white shadow-xl backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            {language === "pt" ? "DESBLOQUEADO" : "UNLOCKED"}
          </div>
        ) : null}
      </div>

      <div className="relative px-6">
        <div className="w-full border-t-2 border-dashed border-white/10" />
      </div>

      <div className="flex flex-1 flex-col bg-[#1a2d24] p-6 pt-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="max-w-[180px]">
            <h4 className="mb-1 truncate text-[10px] font-black uppercase tracking-widest text-white/40">{coupon.businessName}</h4>
            <p className="text-2xl font-black italic tracking-tight text-white">{coupon.discount}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5 shadow-inner">
            <Tag className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="mb-6 mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="truncate text-[10px] font-bold uppercase tracking-tight text-white/40">{coupon.address}</p>
          </div>

          {coupon.lat && coupon.lng && !isLocked && !coupon.used && (
            <button
              onClick={handleNavigate}
              className="rounded-xl border border-primary/20 bg-primary/20 p-2 shadow-lg transition-colors hover:bg-primary/40"
              title={language === "pt" ? "Como chegar" : "How to get there"}
            >
              <Navigation className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>

        {!coupon.used && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-primary/20 bg-black/60 p-4 shadow-inner">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-[9px] font-black uppercase tracking-tight text-white/60">{t("physical_validation_note")}</p>
          </div>
        )}

        <div className="mt-auto">
          <Button
            onClick={() => onUse(coupon.id)}
            disabled={coupon.used || (mounted && isLocked)}
            className={`h-16 w-full rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              coupon.used || (mounted && isLocked)
                ? "border border-white/10 bg-white/5 text-white/30"
                : "bg-primary text-white shadow-2xl shadow-primary/30 hover:bg-primary/80"
            }`}
          >
            {coupon.used ? (
              <span className="font-black opacity-50">{t("coupon_used")}</span>
            ) : coupon.claimed ? (
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-white" />
                {t("show_coupon_qr")}
              </span>
            ) : mounted && isLocked ? (
              <span className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-2 text-[11px] font-black text-white">
                  <Target className="h-4 w-4 text-primary" /> {coupon.requirementLabel}
                </span>
                <span className="text-[9px] font-bold text-primary">({coupon.statusLabel})</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 fill-white" />
                {t("redeem_reward")}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
