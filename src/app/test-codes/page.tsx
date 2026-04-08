
"use client";

import React from "react";
import { useItarare } from "@/hooks/use-itarare";
import { BottomNav } from "@/components/BottomNav";
import { QrCode, ArrowLeft, Smartphone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TestCodesPage() {
  const { spots } = useItarare();

  return (
    <div className="min-h-screen pb-32 px-6 bg-[#0d1a14]">
      <header className="pt-10 pb-8 flex items-center gap-4">
        <Link href="/about" className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Placas de Validação</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Ambiente de Teste para Investidores</p>
        </div>
      </header>

      <main className="space-y-8 max-w-2xl mx-auto">
        {/* GUIA DE SOBREVIVÊNCIA PARA ANÁLISE DE NEGÓCIO */}
        <section className="bg-red-500/10 border border-red-500/20 p-8 rounded-[3rem] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white uppercase tracking-tight text-base">Instruções de Validação</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 bg-black/40 p-5 rounded-[2rem] border border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs text-white">1</div>
              <p className="text-xs text-white/70 leading-relaxed">
                <strong className="text-white">Use o Scanner Integrado.</strong> Para testar a experiência proprietária, não use a câmera nativa do sistema operacional.
              </p>
            </div>

            <div className="flex gap-4 bg-black/40 p-5 rounded-[2rem] border border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs text-white">2</div>
              <p className="text-xs text-white/70 leading-relaxed">
                No app, utilize o botão <span className="text-primary font-black">VALIDAR CHECK-IN</span> nos cards de destino para ativar a prova de presença.
              </p>
            </div>

            <div className="flex gap-4 bg-black/40 p-5 rounded-[2rem] border border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs text-white">3</div>
              <p className="text-xs text-white/70 leading-relaxed">
                Aponte para os códigos abaixo. Caso esteja realizando uma análise remota, certifique-se de que o <span className="text-green-400 font-black">MODO DEMO</span> está ativo na Home.
              </p>
            </div>
          </div>
        </section>

        {/* GRID DE PLACAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {spots.map((spot) => (
            <div key={spot.id} className="bg-[#1a2d24] border border-white/10 p-10 rounded-[4rem] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30 shadow-inner">
                <QrCode className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="font-black text-white uppercase italic tracking-tighter text-2xl leading-tight mb-2">{spot.name}</h3>
              <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.3em] mb-8">Token de Presença Real</p>

              <div className="bg-white p-6 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transition-all duration-500 group-hover:scale-105">
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${spot.id}`}
                  alt={`QR Code para ${spot.name}`}
                  width={220}
                  height={220}
                  className="rounded-3xl"
                  unoptimized
                />
                <div className="absolute inset-0 border-[15px] border-white rounded-[3rem] pointer-events-none" />
              </div>

              <div className="mt-10 space-y-3">
                <code className="bg-black/40 px-5 py-2 rounded-2xl text-[11px] text-primary font-black uppercase tracking-widest border border-white/5 block">
                  ID: {spot.id}
                </code>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Digitalizado exclusivamente pelo Itararé Pass</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-10 flex flex-col items-center gap-4 opacity-40">
           <Smartphone className="w-8 h-8 text-white" />
           <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ambiente de Validação v1.4</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
