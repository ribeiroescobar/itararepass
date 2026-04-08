
"use client";

import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { MapPin, History, ShieldCheck, Quote, Sparkles, BookOpen, Smartphone, Globe } from "lucide-react";
import Image from "next/image";
import { useItarare } from "@/hooks/use-itarare";

const curiosities = [
  {
    title: "O Nome Itararé",
    text: "Vem do Tupi-Guarani 'I-ta-ra-ré' e significa 'A pedra que o rio cavou', referindo-se às grutas esculpidas pelo Rio Itararé.",
    icon: <Quote className="w-5 h-5 text-primary" />
  },
  {
    title: "Caminho das Tropas",
    text: "Ponto estratégico do século XVIII na rota Viamão-Sorocaba, importante posto de registro de gado e comércio.",
    icon: <History className="w-5 h-5 text-blue-500" />
  },
  {
    title: "Revolução de 32",
    text: "Palco de resistência histórica. O relevo acidentado serviu como fortaleza natural estratégica durante o conflito.",
    icon: <ShieldCheck className="w-5 h-5 text-red-500" />
  },
  {
    title: "Transição de Biomas",
    text: "Conhecida pela transição única entre Mata Atlântica e Cerrado, gerando uma biodiversidade riquíssima.",
    icon: <Sparkles className="w-5 h-5 text-green-500" />
  }
];

export default function AboutPage() {
  const { t } = useItarare();

  return (
    <div className="min-h-screen pb-32 px-6">
      <header className="pt-10 pb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">Itararé-SP</h1>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Patrimônio, História e Natureza</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        <div className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
          <Image 
            src="https://picsum.photos/seed/itarare-history/1200/800" 
            alt="Itararé landscape" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
              <h2 className="text-3xl font-black text-white italic leading-none">A Pedra Que o Rio Cavou</h2>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">História & Cultura</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curiosities.map((item, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-3 transition-colors hover:bg-white/[0.08]">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white uppercase tracking-tight text-sm italic">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Sobre o App</h2>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-4">
            <p className="text-sm text-white/60 leading-relaxed">
              O Itararé Pass é a plataforma oficial de fomento ao turismo e comércio local. Através do sistema de check-in georreferenciado, conectamos os visitantes aos atrativos naturais e à rede de serviços da cidade, incentivando o desenvolvimento sustentável da nossa região.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">v2.0 Estável</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">GPS Ativo</span>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-12 pb-12 flex flex-col items-center">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Secretaria de Turismo de Itararé</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
