"use client";

import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { MapPin, History, ShieldCheck, Quote, Sparkles, BookOpen, Smartphone, Globe } from "lucide-react";
import Image from "next/image";
import { useItarare } from "@/hooks/use-itarare";

export default function AboutPage() {
  const { language } = useItarare();

  const content = language === "en"
    ? {
        cityTitle: "Itarare-SP",
        citySubtitle: "Heritage, History and Nature",
        heroTitle: "The Stone Carved by the River",
        historyTitle: "History & Culture",
        appTitle: "About the App",
        appDescription:
          "Itarare Pass is the official platform for boosting tourism and local commerce. Through geo-verified check-ins, we connect visitors to natural attractions and to the city's service network, encouraging sustainable growth across the region.",
        versionLabel: "v2.0 Stable",
        gpsLabel: "GPS Active",
        footer: "Itarare Tourism Secretariat",
        curiosities: [
          {
            title: "The Name Itarare",
            text: "It comes from Tupi-Guarani 'I-ta-ra-re' and means 'The stone carved by the river', a reference to the caves shaped by the Itarare River.",
            icon: <Quote className="w-5 h-5 text-primary" />,
          },
          {
            title: "Troop Route",
            text: "A strategic 18th-century point on the Viamao-Sorocaba route, important for cattle registration and trade.",
            icon: <History className="w-5 h-5 text-blue-500" />,
          },
          {
            title: "1932 Revolution",
            text: "A setting of historic resistance. The rugged landscape served as a natural stronghold during the conflict.",
            icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
          },
          {
            title: "Biome Transition",
            text: "Known for the rare meeting point between Atlantic Forest and Cerrado, creating rich biodiversity.",
            icon: <Sparkles className="w-5 h-5 text-green-500" />,
          },
        ],
      }
    : {
        cityTitle: "Itarare-SP",
        citySubtitle: "Patrimonio, Historia e Natureza",
        heroTitle: "A Pedra Que o Rio Cavou",
        historyTitle: "Historia & Cultura",
        appTitle: "Sobre o App",
        appDescription:
          "O Itarare Pass e a plataforma oficial de fomento ao turismo e comercio local. Atraves do sistema de check-in georreferenciado, conectamos os visitantes aos atrativos naturais e a rede de servicos da cidade, incentivando o desenvolvimento sustentavel da nossa regiao.",
        versionLabel: "v2.0 Estavel",
        gpsLabel: "GPS Ativo",
        footer: "Secretaria de Turismo de Itarare",
        curiosities: [
          {
            title: "O Nome Itarare",
            text: "Vem do Tupi-Guarani 'I-ta-ra-re' e significa 'A pedra que o rio cavou', referindo-se as grutas esculpidas pelo Rio Itarare.",
            icon: <Quote className="w-5 h-5 text-primary" />,
          },
          {
            title: "Caminho das Tropas",
            text: "Ponto estrategico do seculo XVIII na rota Viamao-Sorocaba, importante posto de registro de gado e comercio.",
            icon: <History className="w-5 h-5 text-blue-500" />,
          },
          {
            title: "Revolucao de 32",
            text: "Palco de resistencia historica. O relevo acidentado serviu como fortaleza natural estrategica durante o conflito.",
            icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
          },
          {
            title: "Transicao de Biomas",
            text: "Conhecida pela transicao unica entre Mata Atlantica e Cerrado, gerando uma biodiversidade riquissima.",
            icon: <Sparkles className="w-5 h-5 text-green-500" />,
          },
        ],
      };

  return (
    <div className="min-h-screen pb-32 px-6">
      <header className="pt-10 pb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">{content.cityTitle}</h1>
        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{content.citySubtitle}</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        <div className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
          <Image
            src="https://picsum.photos/seed/itarare-history/1200/800"
            alt="Itarare landscape"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
            <h2 className="text-3xl font-black text-white italic leading-none">{content.heroTitle}</h2>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">{content.historyTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.curiosities.map((item, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-3 transition-colors hover:bg-white/[0.08]">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white uppercase tracking-tight text-sm italic">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">{content.appTitle}</h2>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] space-y-4">
            <p className="text-sm text-white/60 leading-relaxed">{content.appDescription}</p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{content.versionLabel}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{content.gpsLabel}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-12 pb-12 flex flex-col items-center">
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{content.footer}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
