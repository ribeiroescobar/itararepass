
"use client";

import React, { useState, useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { BottomNav } from "@/components/BottomNav";
import { QRScanner } from "@/components/QRScanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, QrCode, Store, TrendingUp, History, User, Loader2, ShieldAlert, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function MerchantDashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const { t, isAuthorized, isUserLoading, profile } = useItarare();
  const router = useRouter();

  // Proteção de Rota
  useEffect(() => {
    if (!isUserLoading && !profile) {
      router.push('/login');
    }
  }, [isUserLoading, profile, router]);

  const handleScan = (touristCode: string) => {
    toast({
      title: "Benefício Aplicado!",
      description: "O cupom foi validado com sucesso no PDV.",
    });
    setShowScanner(false);
  };

  if (isUserLoading) return (
    <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-4 text-center">Verificando Credenciais...</p>
    </div>
  );

  // Interface para Comerciante PENDENTE
  if (profile?.role === 'merchant' && !profile.approved) {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 mb-8 animate-pulse">
          <Clock className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Cadastro em Análise</h1>
        <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-8">
          Olá, <strong>{profile.name}</strong>! Sua solicitação de parceiro foi recebida. A Secretaria de Turismo de Itararé validará seus dados em até 48h úteis.
        </p>
        <Button onClick={() => router.push('/profile')} variant="outline" className="border-white/10 text-white/40 uppercase font-black text-[10px] tracking-widest rounded-2xl h-12 px-8">
          Voltar ao Perfil
        </Button>
        <BottomNav />
      </div>
    );
  }

  // Bloqueio para quem não é comerciante nem admin
  if (profile?.role === 'tourist') {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-white uppercase italic">Acesso Restrito</h1>
        <p className="text-xs text-white/40 mt-2 uppercase font-bold">Esta área é exclusiva para parceiros comerciais.</p>
        <Button onClick={() => router.push('/explore')} className="mt-8 bg-primary rounded-2xl h-12 px-8 font-black uppercase text-[10px]">Ir para Exploração</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1a14] pb-32 px-6">
      <header className="pt-10 pb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">Painel do Comerciante</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Gestão de Recompensas B2B</p>
        </div>
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-xl shadow-primary/10">
          <Store className="w-6 h-6 text-primary" />
        </div>
      </header>

      <main className="max-w-xl mx-auto space-y-6">
        <Card className="bg-primary/5 border-primary/20 p-8 rounded-[3rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Store className="w-32 h-32 text-primary" />
          </div>
          
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 relative z-10">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Validar Turista</h2>
            <p className="text-xs text-white/40 mt-2 leading-relaxed max-w-[250px] mx-auto">
              Escaneie o QR Code do passaporte digital do turista para confirmar seus check-ins e dar baixa no benefício.
            </p>
          </div>
          <Button 
            onClick={() => setShowScanner(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-[2rem] text-xs uppercase tracking-widest shadow-xl shadow-primary/20 relative z-10 transition-all active:scale-95"
          >
            Abrir Scanner de Vendas
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <TrendingUp className="w-5 h-5 text-green-500 mb-3" />
            <p className="text-2xl font-black text-white">0</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Cupons hoje</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <User className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-black text-white">0</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Turistas únicos</p>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <History className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Atividade Recente</h3>
          </div>
          <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-[10px] text-white/20 font-bold uppercase">Nenhuma atividade hoje</p>
          </div>
        </section>
      </main>

      {showScanner && (
        <QRScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
          targetName="Passaporte do Turista" 
          demoMode={false} 
          targetId="any"
        />
      )}
      <BottomNav />
    </div>
  );
}
