"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coupon, useItarare } from "@/hooks/use-itarare";
import { Tag, Sparkles, Lock, MapPin, Navigation, Info, Target } from "lucide-react";

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
        lng: coupon.lng
      });
      router.push('/map');
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-[#1a2d24] border-none rounded-[2rem] shadow-2xl flex flex-col group transition-all duration-300 ${coupon.used ? 'opacity-40 grayscale' : 'hover:scale-[1.02]'}`}>
      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full z-10 -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full z-10 -translate-y-1/2" />
      
      <div className="relative h-32 w-full">
        <Image 
          src={coupon.image} 
          alt={coupon.businessName} 
          fill 
          className={`object-cover transition-opacity ${isLocked ? 'opacity-30' : 'opacity-100'}`}
          data-ai-hint="restaurant food hotel"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2d24] via-black/10 to-transparent" />
        
        {mounted && isLocked ? (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="bg-primary p-3 rounded-2xl mb-3 shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-xl mb-2">
              <p className="text-[11px] font-black text-black uppercase tracking-tight">{coupon.requirementLabel}</p>
            </div>
            <div className="bg-primary px-3 py-1 rounded-lg border border-white/30 shadow-lg">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{coupon.statusLabel}</p>
            </div>
          </div>
        ) : mounted && !isLocked && (
          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xl border border-white/20">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            {language === 'pt' ? 'DESBLOQUEADO' : 'UNLOCKED'}
          </div>
        )}
      </div>
      
      <div className="px-6 relative">
        <div className="border-t-2 border-dashed border-white/10 w-full" />
      </div>

      <div className="p-6 pt-5 bg-[#1a2d24] flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="max-w-[180px]">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 truncate">{coupon.businessName}</h4>
            <p className="text-2xl font-black text-white italic tracking-tight">{coupon.discount}</p>
          </div>
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
            <Tag className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-white/40 truncate uppercase tracking-tight">{coupon.address}</p>
          </div>
          
          {coupon.lat && coupon.lng && !isLocked && !coupon.used && (
            <button 
              onClick={handleNavigate}
              className="bg-primary/20 hover:bg-primary/40 p-2 rounded-xl border border-primary/20 transition-colors shadow-lg"
              title={language === 'pt' ? "Como chegar" : "How to get there"}
            >
              <Navigation className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>

        {/* Nota de Transparência - Mais Visível */}
        {!coupon.used && (
          <div className="mb-6 bg-black/60 p-4 rounded-2xl border border-primary/20 flex gap-3 shadow-inner">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[9px] font-black text-white/60 leading-relaxed uppercase tracking-tight">
              {t('physical_validation_note')}
            </p>
          </div>
        )}
        
        <div className="mt-auto">
          <Button 
            onClick={() => onUse(coupon.id)}
            disabled={coupon.used || (mounted && isLocked)}
            className={`w-full font-black h-16 rounded-2xl text-xs uppercase tracking-widest transition-all ${
              (coupon.used || (mounted && isLocked))
              ? "bg-white/5 text-white/30 border border-white/10" 
              : "bg-primary hover:bg-primary/80 text-white shadow-2xl shadow-primary/30"
            }`}
          >
            {coupon.used ? (
              <span className="font-black opacity-50">{t('coupon_used')}</span>
            ) : (mounted && isLocked) ? (
              <span className="flex flex-col items-center gap-1.5">
                <span className="flex items-center gap-2 text-white font-black text-[11px]">
                  <Target className="w-4 h-4 text-primary" /> {coupon.requirementLabel}
                </span>
                <span className="text-[9px] text-primary font-bold">({coupon.statusLabel})</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 fill-white" />
                {t('redeem_reward')}
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
