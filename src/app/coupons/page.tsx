
"use client";

import React, { useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { CouponCard } from "@/components/CouponCard";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Wallet, Info, Sparkles, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CouponsPage() {
  const { coupons, useCoupon, t, user, profile, isUserLoading } = useItarare();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!isUserLoading && user && profile?.role && profile.role !== "tourist") {
      router.replace(profile.role === "merchant" ? "/merchant/dashboard" : "/admin/dashboard");
    }
  }, [user, profile?.role, isUserLoading, router]);

  const handleUseCoupon = (id: string) => {
    useCoupon(id);
    toast({
      title: t('reward_redeemed'),
      description: t('show_to_attendant'),
    });
  };

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto">
      <header className="pt-8 pb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-accent/20 rounded-[1.5rem] flex items-center justify-center border border-accent/30 shadow-xl shadow-accent/5">
            <Wallet className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{t('my_wallet')}</h1>
            <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {t('unlocked_rewards')}
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} onUse={handleUseCoupon} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Info className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{t('empty_wallet')}</h3>
              <p className="text-sm text-white/40 max-w-[250px]">{t('empty_wallet_desc')}</p>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="p-8 bg-gradient-to-br from-accent to-orange-600 rounded-[2.5rem] text-white shadow-2xl shadow-accent/20 relative overflow-hidden sticky top-24">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            
            <h4 className="text-sm font-black uppercase mb-4 tracking-widest">{t('expert_tip')}</h4>
            <p className="text-sm font-medium leading-relaxed mb-6 opacity-90">
              "{t('expert_tip_text')}"
            </p>
            
            <div className="pt-6 border-t border-white/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60">{t('next_goal')}</p>
                <p className="text-xl font-black italic">5 {t('checkins')}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      <BottomNav />
      <Toaster />
    </div>
  );
}

const Trophy = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
