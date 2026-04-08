
"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  ChevronLeft, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Map as MapIcon, 
  Sparkles,
  Code2,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    title: "Itararé Pass",
    subtitle: "Inteligência de Fluxo e Economia Circular",
    content: "Uma plataforma PWA que conecta a natureza exuberante de Itararé ao seu comércio vibrante, combatendo a informalidade com tecnologia proprietária.",
    icon: <Rocket className="w-12 h-12 text-primary" />,
    image: "https://picsum.photos/seed/slide1/1200/600",
    hint: "canyon sunrise itarare"
  },
  {
    title: "O Problema",
    subtitle: "Turismo de Passagem e Evasão Fiscal",
    content: "Até 70% dos turistas visitam os cânions e retornam no mesmo dia. A informalidade hoteleira gera perda direta de arrecadação de ISS para o município.",
    icon: <Globe className="w-12 h-12 text-red-500" />,
    image: "https://picsum.photos/seed/slide2/1200/600",
    hint: "old city map"
  },
  {
    title: "A Stack Tecnológica",
    subtitle: "Alta Performance e Resiliência",
    content: "Utilizamos Next.js 15 e React 19 para garantir velocidade extrema e uma experiência de App Nativo, essencial para áreas de baixa conectividade.",
    icon: <Code2 className="w-12 h-12 text-blue-500" />,
    tech: [
      { name: "Next.js 15", desc: "Velocidade e Server Components" },
      { name: "React 19", desc: "Interface Reativa de Última Geração" },
      { name: "PWA Nativo", desc: "Instalação sem loja de aplicativos" }
    ]
  },
  {
    title: "Inteligência Artificial",
    subtitle: "Storytelling com Genkit + Gemini",
    content: "A IA atua como um guia cultural dinâmico, gerando insights históricos em tempo real após cada check-in, aumentando o valor percebido da visita.",
    icon: <Sparkles className="w-12 h-12 text-purple-500" />,
    image: "https://picsum.photos/seed/ai-tech/800/400",
    hint: "artificial intelligence brain"
  },
  {
    title: "Geolocalização Offline",
    subtitle: "Segurança e Dados em Zonas de Sombra",
    content: "Nosso sistema de mapas baseado em Leaflet.js funciona sem sinal 4G, garantindo navegação segura e coleta de dados de fluxo precisos.",
    icon: <MapIcon className="w-12 h-12 text-green-500" />,
    image: "https://picsum.photos/seed/map-offline/800/400",
    hint: "gps satellite map"
  },
  {
    title: "Validação Híbrida",
    subtitle: "Proof of Presence Antifraude",
    content: "Os benefícios só são liberados via GPS + QR Code físico no balcão de parceiros oficiais, forçando o fluxo econômico para o setor formalizado.",
    icon: <ShieldCheck className="w-12 h-12 text-accent" />,
    image: "https://picsum.photos/seed/shield/800/400",
    hint: "secure payment seal"
  }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#0d1a14] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">IP</div>
            <h1 className="font-black uppercase tracking-tighter italic">Itararé Pass <span className="text-primary">Startup Pitch</span></h1>
          </div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Slide {currentSlide + 1} de {slides.length}
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px]">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-block p-4 bg-white/5 rounded-3xl border border-white/10 mb-4">
              {slide.icon}
            </div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              {slide.title}
            </h2>
            <h3 className="text-xl font-bold text-primary uppercase tracking-tight">
              {slide.subtitle}
            </h3>
            <p className="text-lg text-white/60 leading-relaxed">
              {slide.content}
            </p>

            {slide.tech && (
              <div className="grid grid-cols-1 gap-3 pt-6">
                {slide.tech.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <Cpu className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-black uppercase">{t.name}</p>
                      <p className="text-[10px] text-white/40">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-700">
            {slide.image ? (
              <Image 
                src={slide.image} 
                alt={slide.title} 
                fill 
                className="object-cover"
                data-ai-hint={slide.hint}
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <Code2 className="w-24 h-24 text-primary/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </main>

        <footer className="mt-16 flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={prevSlide}
              className="rounded-full w-14 h-14 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
              variant="outline" 
              onClick={nextSlide}
              className="rounded-full w-14 h-14 bg-primary border-none hover:bg-primary/80"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              Voltar ao App
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Análise de Investimento 2025</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
