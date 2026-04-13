"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useItarare } from "@/hooks/use-itarare";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, isUserLoading, isProfileLoading } = useItarare();
  const isMaster = profile?.tipo_usuario === "admin_master";

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (isProfileLoading) return;

    if (profile) {
      if (profile.tipo_usuario === "admin_master") {
        router.replace("/admin/dashboard");
        return;
      }
      if (profile.role === "admin") {
        router.replace(profile.approved ? "/admin/dashboard" : "/profile");
        return;
      }
      if (profile.role === "merchant") {
        router.replace(profile.approved ? "/merchant/dashboard" : "/profile");
        return;
      }
      router.replace("/explore");
      return;
    }

    router.replace("/explore");
  }, [user, profile, isUserLoading, isProfileLoading, router]);

  return (
    <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">
          {isMaster ? "Acessando Painel Master" : "Autenticando Identidade"}
        </p>
        <p className="text-[8px] text-white/20 font-bold uppercase mt-2 tracking-widest">
          Iniciando Protocolos de Segurança
        </p>
      </div>
    </div>
  );
}
