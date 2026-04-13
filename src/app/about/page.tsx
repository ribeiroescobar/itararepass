"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  Globe,
  History,
  MapPin,
  Quote,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";

export default function AboutPage() {
  const { language } = useItarare();

  const content =
    language === "en"
      ? {
          cityTitle: "Itarare-SP",
          citySubtitle: "Heritage, History and Nature",
          heroTitle: "The Stone Carved by the River",
          heroDescription:
            "A destination shaped by canyons, historic routes and a local network that welcomes visitors with culture, nature and hospitality.",
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
              icon: <Quote className="h-5 w-5 text-primary" />,
            },
            {
              title: "Troop Route",
              text: "A strategic 18th-century point on the Viamao-Sorocaba route, important for cattle registration and trade.",
              icon: <History className="h-5 w-5 text-blue-500" />,
            },
            {
              title: "1932 Revolution",
              text: "A setting of historic resistance. The rugged landscape served as a natural stronghold during the conflict.",
              icon: <ShieldCheck className="h-5 w-5 text-red-500" />,
            },
            {
              title: "Biome Transition",
              text: "Known for the rare meeting point between Atlantic Forest and Cerrado, creating rich biodiversity.",
              icon: <Sparkles className="h-5 w-5 text-green-500" />,
            },
          ],
        }
      : {
          cityTitle: "Itarare-SP",
          citySubtitle: "Patrimonio, Historia e Natureza",
          heroTitle: "A Pedra Que o Rio Cavou",
          heroDescription:
            "Um destino moldado por canions, rotas historicas e uma rede local que recebe visitantes com cultura, natureza e hospitalidade.",
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
              icon: <Quote className="h-5 w-5 text-primary" />,
            },
            {
              title: "Caminho das Tropas",
              text: "Ponto estrategico do seculo XVIII na rota Viamao-Sorocaba, importante posto de registro de gado e comercio.",
              icon: <History className="h-5 w-5 text-blue-500" />,
            },
            {
              title: "Revolucao de 32",
              text: "Palco de resistencia historica. O relevo acidentado serviu como fortaleza natural estrategica durante o conflito.",
              icon: <ShieldCheck className="h-5 w-5 text-red-500" />,
            },
            {
              title: "Transicao de Biomas",
              text: "Conhecida pela transicao unica entre Mata Atlantica e Cerrado, gerando uma biodiversidade riquissima.",
              icon: <Sparkles className="h-5 w-5 text-green-500" />,
            },
          ],
        };

  return (
    <div className="min-h-screen px-4 pb-32 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-6xl pt-8 sm:pt-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary shadow-lg shadow-primary/5">
          <MapPin className="h-3.5 w-3.5" />
          {content.cityTitle}
        </div>

        <div className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
            {content.heroDescription}
          </p>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
            {content.citySubtitle}
          </p>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-6xl flex-col gap-8 sm:mt-10 lg:gap-10">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#122219] shadow-2xl shadow-black/20 sm:min-h-[420px] sm:rounded-[2.5rem]">
            <Image
              src="https://picsum.photos/seed/itarare-history/1400/1000"
              alt="Itarare landscape"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_38%),linear-gradient(180deg,rgba(6,12,9,0.12)_0%,rgba(6,12,9,0.8)_70%,rgba(6,12,9,0.96)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
              <div className="max-w-xl rounded-[1.5rem] border border-white/10 bg-black/25 p-4 backdrop-blur-md sm:rounded-[2rem] sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/90">
                  {content.citySubtitle}
                </p>
                <h2 className="mt-3 text-2xl font-black italic leading-tight text-white sm:text-3xl">
                  {content.heroTitle}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-[15px]">
                  {content.heroDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/15">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-white sm:text-xl">
                {content.historyTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {language === "en"
                  ? "A city where natural landscapes and historic memory shape the visitor experience."
                  : "Uma cidade em que paisagem natural e memoria historica constroem a experiencia do visitante."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-5 shadow-xl shadow-black/10 sm:p-6">
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{content.versionLabel}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{content.gpsLabel}</span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                {language === "en"
                  ? "Built for mobile use, on-site validation and local economic impact."
                  : "Construido para uso mobile, validacao presencial e impacto economico local."}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white sm:text-xl">{content.historyTitle}</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/30">
                {language === "en" ? "Highlights that shape the city identity" : "Pontos que ajudam a contar a identidade da cidade"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.curiosities.map((item, index) => (
              <article
                key={index}
                className="group flex min-h-[220px] flex-col rounded-[2rem] border border-white/8 bg-white/5 p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.07] sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-black uppercase leading-snug tracking-tight text-white sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/14 via-primary/6 to-transparent p-6 shadow-2xl shadow-black/10 sm:rounded-[2.5rem] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-5 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">{content.appTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-[15px]">{content.appDescription}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                {language === "en" ? "Tourism activation" : "Ativacao do turismo"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {language === "en"
                  ? "The experience encourages discovery of official attractions and values the territory through presence-based journeys."
                  : "A experiencia estimula a descoberta dos atrativos oficiais e valoriza o territorio por meio de jornadas baseadas em presenca real."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">
                {language === "en" ? "Local commerce" : "Comercio local"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {language === "en"
                  ? "Benefits are redeemed in participating businesses, connecting visitor flow with measurable commercial return."
                  : "Os beneficios sao utilizados nos estabelecimentos parceiros, conectando fluxo turistico com retorno comercial mensuravel."}
              </p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center pb-8 pt-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/20">{content.footer}</p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
