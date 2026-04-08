
"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Store, Building2, ShieldCheck, ArrowRight, Zap, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useItarare } from "@/hooks/use-itarare";

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

export default function EntryPortalPage() {
  const router = useRouter();
  const { login, user, isUserLoading, isMaster, profile, language, setLanguage, t } = useItarare();
  const [isMasterLoading, setIsMasterLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      if (isMaster) {
        router.push("/admin/dashboard");
      } else if (profile?.role === 'merchant') {
        router.push("/merchant/dashboard");
      } else {
        router.push("/explore");
      }
    }
  }, [user, isUserLoading, isMaster, profile, router]);

  const portalOptions = [
    {
      title: t('role_tourist'),
      desc: language === 'pt' ? "Explorar atrativos e ganhar recompensas" : "Explore attractions and earn rewards",
      icon: <User className="w-6 h-6 text-green-400" />,
      path: "/auth/tourist",
      color: "hover:bg-green-500/10 border-green-500/20"
    },
    {
      title: t('role_merchant'),
      desc: language === 'pt' ? "Validar cupons e gerir vendas" : "Validate coupons and manage sales",
      icon: <Store className="w-6 h-6 text-primary" />,
      path: "/auth/merchant",
      color: "hover:bg-primary/10 border-primary/20"
    },
    {
      title: language === 'pt' ? "Gestão Municipal" : "Municipal Management",
      desc: language === 'pt' ? "Acesso para funcionários da Prefeitura" : "Access for City Hall employees",
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      path: "/auth/admin",
      color: "hover:bg-blue-500/10 border-blue-500/20"
    },
    {
      title: language === 'pt' ? "Administrador Master" : "Master Admin",
      desc: language === 'pt' ? "Acesso total ao sistema (Douglas)" : "Full system access (Douglas)",
      icon: <KeyRound className="w-6 h-6 text-purple-400" />,
      path: "/auth/admin",
      color: "hover:bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-6 relative overflow-hidden">
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

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg space-y-10 relative z-10 pt-20 sm:pt-0">
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo />
          <div>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              {t('login_system_title')}
            </h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] mt-2">
              {t('login_system_subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {portalOptions.map((opt, i) => (
            <Card 
              key={i}
              onClick={() => router.push(opt.path)}
              className={`bg-white/5 border-white/10 p-6 rounded-[2.5rem] cursor-pointer transition-all active:scale-95 group flex items-center justify-between ${opt.color}`}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase italic leading-none">{opt.title}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight mt-1">{opt.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Card>
          ))}
        </div>

        <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
          Secretaria de Turismo de Itararé • 2025
        </p>
      </div>
    </div>
  );
}
