
"use client";

import React, { useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { ArcProgress } from "@/components/ArcProgress";
import { CheckInCard } from "@/components/CheckInCard";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import { Wallet, Tag, ArrowRight, Zap, CalendarDays, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { FeaturedMerchants } from "@/components/FeaturedMerchants";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const FlagBR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#009739"/><path d="M10 2L18 7L10 12L2 7L10 2Z" fill="#FEDD00"/><circle cx="10" cy="7" r="3" fill="#012169"/>
  </svg>
);

const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#FFFFFF"/><rect width="20" height="1.07" fill="#B22234"/><rect y="2.15" width="20" height="1.07" fill="#B22234"/><rect y="4.30" width="20" height="1.07" fill="#B22234"/><rect y="6.46" width="20" height="1.07" fill="#B22234"/><rect y="8.61" width="20" height="1.07" fill="#B22234"/><rect y="10.76" width="20" height="1.07" fill="#B22234"/><rect y="12.92" width="20" height="1.07" fill="#B22234"/><rect width="8.6" height="7.53" fill="#3C3B6E"/><circle cx="1" cy="1" r="0.2" fill="white"/><circle cx="3" cy="1" r="0.2" fill="white"/><circle cx="5" cy="1" r="0.2" fill="white"/><circle cx="7" cy="1" r="0.2" fill="white"/>
  </svg>
);

export default function ExplorePage() {
  const router = useRouter();
  const { 
    user,
    spots, 
    coupons, 
    profile,
    checkIn, 
    userLocation, 
    language,
    setLanguage,
    isUserLoading,
    t,
    demoMode,
    setDemoMode,
    pendingCheckinsCount,
    isOfflineMode,
    isSyncingPendingCheckins,
    emergencyContacts,
  } = useItarare();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!isUserLoading && user && profile?.role && profile.role !== "tourist") {
      router.replace(profile.role === "merchant" ? "/merchant/dashboard" : "/admin/dashboard");
    }
  }, [user, profile?.role, isUserLoading, router]);

  if (isUserLoading || !user) return null;

  const visitedCount = spots.filter(s => s.visited).length;
  const adventureSpots = spots.filter(s => s.type === 'adventure');
  const lodgingSpots = spots.filter(s => s.type === 'lodging');
  const unlockedCoupons = coupons.filter(c => !c.locked && !c.used);
  const featuredMerchants = coupons.filter(c => c.isPremium);
  const displayMerchants = featuredMerchants.length > 0 ? featuredMerchants : coupons.slice(0, 5);
  const primaryEmergencyPhone = emergencyContacts[0]?.phone?.replace(/[^0-9]/g, "") || "193";

  return (
    <div className="min-h-screen bg-background pb-32 w-full max-w-full overflow-x-hidden">
      <header className="pt-32 pb-14 px-6 relative flex flex-col items-center text-center bg-background overflow-hidden">
        
        {/* Idioma (Esquerda) */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5 h-11 shadow-2xl">
            <button onClick={() => setLanguage('pt')} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === 'pt' ? 'bg-white/10 ring-1 ring-white/20' : 'opacity-40'}`}>
              <FlagBR /><span className="text-[10px] font-black text-white">PT</span>
            </button>
            <button onClick={() => setLanguage('en')} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === 'en' ? 'bg-white/10 ring-1 ring-white/20' : 'opacity-40'}`}>
              <FlagUS /><span className="text-[10px] font-black text-white">EN</span>
            </button>
          </div>
        </div>

        {/* MODO DEMO (Direita) - ESSENCIAL PARA O PITCH */}
        {/* Deslocado para right-20 para não ficar sob o botão de acessibilidade */}
        <div className="absolute top-6 right-20 z-50 flex items-center gap-2 bg-black/60 p-2 rounded-2xl border border-white/5 shadow-2xl h-11 pr-3 transition-all">
          <div className={`p-1.5 rounded-lg transition-colors ${demoMode ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
            <Zap className={`w-3.5 h-3.5 ${demoMode ? 'fill-current' : ''}`} />
          </div>
          <div className="flex flex-col items-start mr-1">
            <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Modo</span>
            <span className={`text-[9px] font-black uppercase tracking-tight ${demoMode ? 'text-primary' : 'text-white/40'}`}>Demo</span>
          </div>
          <Switch 
            checked={demoMode} 
            onCheckedChange={setDemoMode}
            className="data-[state=checked]:bg-primary scale-75"
          />
        </div>

        <Logo />
        
        <div className="mt-8 px-4">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase italic">
            {t('welcome')}, {profile?.name?.split(' ')[0] || t('visitor')}!
          </h2>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">{t('explore_and_win')}</p>
        </div>

        <div className="mt-10 bg-white/5 border border-white/10 p-8 rounded-[3.5rem] w-full max-w-sm mx-4 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Wallet className="w-32 h-32 text-primary" />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[180px]">
              <ArcProgress current={visitedCount} total={spots.length} />
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 w-full space-y-6">
              <div className="flex justify-between items-center px-2 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                    <Tag className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{t('unlocked_rewards')}</span>
                </div>
                <span className="text-2xl font-black text-white italic">{unlockedCoupons.length}</span>
              </div>
              
              <Link href="/coupons" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase h-14 rounded-2xl tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                  {t('my_wallet')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 grid w-full max-w-sm grid-cols-2 gap-3">
          <Link href="/events" className="group">
            <div className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-500/14 to-sky-500/8 p-5 text-left shadow-xl transition-all active:scale-95 group-hover:bg-blue-500/15 min-h-[136px] flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="mt-6 text-xl font-black uppercase tracking-tight italic text-blue-200">Eventos</p>
            </div>
          </Link>

          <a href={`tel:${primaryEmergencyPhone}`} className="group">
            <div className="rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/14 to-orange-500/8 p-5 text-left shadow-xl transition-all active:scale-95 group-hover:bg-red-500/15 min-h-[136px] flex flex-col justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <p className="mt-6 text-xl font-black uppercase tracking-tight italic text-red-200">SOS</p>
            </div>
          </a>
        </div>

        {(isOfflineMode || pendingCheckinsCount > 0 || isSyncingPendingCheckins) && (
          <div className="mt-6 w-full max-w-sm rounded-[2rem] border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-left shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">
              {isOfflineMode ? "Modo offline ativo" : isSyncingPendingCheckins ? "Sincronizando leituras" : "Leituras pendentes"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/70">
              {isOfflineMode
                ? "As placas lidas serao guardadas no aparelho e enviadas ao servidor quando a internet voltar."
                : isSyncingPendingCheckins
                  ? "O app esta validando no servidor as placas que foram lidas sem internet."
                  : `${pendingCheckinsCount} leitura(s) de placa aguardando autenticacao com o servidor.`}
            </p>
          </div>
        )}
      </header>

      <main className="px-6 space-y-12 w-full max-w-5xl mx-auto">
        <FeaturedMerchants merchants={displayMerchants} />

        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/40" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">{t('adventure_route')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {adventureSpots.map(spot => (
              <CheckInCard key={spot.id} spot={spot} onCheckIn={checkIn} userLocation={userLocation} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">{t('lodging_route')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lodgingSpots.map(spot => (
              <CheckInCard key={spot.id} spot={spot} onCheckIn={checkIn} userLocation={userLocation} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
      <Toaster />
    </div>
  );
}
