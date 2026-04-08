
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useItarare } from "@/hooks/use-itarare";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, isUserLoading, isProfileLoading, isMaster } = useItarare();

  useEffect(() => {
    if (isUserLoading) return;

    // Se não há usuário, vai para login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Se é o Douglas, ignora qualquer carregamento de perfil e vai pro Dashboard
    if (isMaster) {
      router.replace("/admin/dashboard");
      return;
    }

    // Para outros usuários, aguarda o carregamento do perfil para decidir o destino
    if (isProfileLoading) return;

    if (profile && profile.approved) {
      if (profile.tipo_usuario === "prefeitura") {
        router.replace("/admin/dashboard");
      } else if (profile.tipo_usuario === "logista") {
        router.replace("/merchant/dashboard");
      } else {
        router.replace("/explore");
      }
    } else {
      // Se logado mas sem perfil ou não aprovado, vai para explorar
      router.replace("/explore");
    }
  }, [user, profile, isUserLoading, isProfileLoading, isMaster, router]);

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
