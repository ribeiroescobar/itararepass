"use client";

import React from "react";
import Image from "next/image";
import { Star, Sparkles, Crown, ChevronRight, Info, CheckCircle2, Lock } from "lucide-react";
import { Coupon } from "@/hooks/use-business";
import { useItarare } from "@/hooks/use-itarare";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FeaturedMerchantsProps {
  merchants: Coupon[];
}

export function FeaturedMerchants({ merchants }: FeaturedMerchantsProps) {
  const { t } = useItarare();

  if (merchants.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-lg shadow-amber-500/40" />
          <h3 className="text-lg font-black text-white uppercase tracking-tight italic flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            {t('featured_partners')}
          </h3>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 -mx-2">
        {merchants.map((merchant) => (
          <Link key={merchant.id} href="/coupons" className="shrink-0">
            <div className="relative w-64 aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-amber-500/20">
              <Image 
                src={merchant.image || "/logo.jpeg"} 
                alt={merchant.businessName} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Badge Premium */}
              <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-white/20 shadow-xl z-10">
                <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">{t('premium_badge')}</span>
              </div>

              {/* CONTEÚDO INFERIOR */}
              <div className="absolute bottom-6 left-6 right-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">{merchant.discount}</p>
                  <h4 className="text-xl font-black text-white uppercase italic leading-tight tracking-tighter">{merchant.businessName}</h4>
                  
                  <div className="flex items-center gap-1 mt-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    ))}
                    <span className="text-[10px] text-white/60 font-bold ml-2 uppercase">Parceiro Oficial</span>
                  </div>
                </div>

                {/* Status de Missão */}
                <div className="flex flex-col gap-1.5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md w-fit shadow-2xl ${merchant.locked ? 'bg-black/60' : 'bg-green-500/60 animate-pulse'}`}>
                    {merchant.locked ? <Lock className="w-3 h-3 text-primary" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
                    <span className="text-[9px] font-black text-white uppercase tracking-tight">
                      {merchant.requirementLabel}
                    </span>
                  </div>
                  {merchant.locked && (
                    <div className="bg-primary/90 px-3 py-1 rounded-lg text-white font-black text-[8px] uppercase tracking-widest shadow-xl w-fit">
                      {merchant.statusLabel}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </Link>
        ))}
        
        <div className="shrink-0 w-48 aspect-[4/5] rounded-[2.5rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-4">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white/20" />
           </div>
           <div>
             <p className="text-[10px] font-black text-white/40 uppercase leading-tight">Sua empresa aqui?</p>
             <p className="text-[8px] text-white/20 font-bold uppercase mt-1">Destaque VIP no app</p>
           </div>
           <ChevronRight className="w-4 h-4 text-white/10" />
        </div>
      </div>

      <div className="px-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 px-6 rounded-[2rem] flex items-center justify-between group transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-tight italic">{t('how_to_unlock')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#0d1a14] border-white/10 rounded-[3rem] p-8 max-w-[90vw] sm:max-w-md">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-black text-white uppercase italic tracking-tighter text-center">
                {t('unlock_guide_title')}
              </AlertDialogTitle>
              {/* Usando asChild para evitar div dentro de p */}
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                      <span className="font-black text-primary text-xs">01</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium pt-2">
                      {t('unlock_guide_step1')}
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                      <span className="font-black text-primary text-xs">02</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium pt-2">
                      {t('unlock_guide_step2')}
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                      <span className="font-black text-primary text-xs">03</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium pt-2">
                      {t('unlock_guide_step3')}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-8">
              <AlertDialogAction className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl w-full">
                Entendi, vamos explorar!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
