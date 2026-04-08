
"use client";

import React from "react";
import { 
  ShieldCheck, 
  Rocket,
  CheckCircle2,
  Printer
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PrintPitchPage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-10 max-w-[210mm] mx-auto relative">
      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; background: white !important; }
            .no-print { display: none !important; }
            .page-break-before { page-break-before: always; }
            @page { margin: 1cm; }
          }
        `}
      </style>

      {/* Botão de Impressão (Não aparece no papel) */}
      <div className="fixed top-6 right-6 no-print z-50">
        <Button 
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/90 text-white font-black rounded-full px-6 h-14 shadow-2xl flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      {/* Header / Capa */}
      <header className="border-b-8 border-primary pb-8 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Itararé <span className="text-primary">Pass</span>
          </h1>
          <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Investment Analysis Memo - Startup Vision</p>
        </div>
        <div className="text-right">
          <p className="font-black text-sm uppercase">Versão Final MVP</p>
          <p className="text-xs text-gray-400">itarare-pass-startup-v1.4</p>
        </div>
      </header>

      {/* Visão Geral */}
      <section className="mb-12">
        <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
          <Rocket className="w-10 h-10 text-primary" /> 01. A Proposta de Valor
        </h2>
        <div className="grid grid-cols-5 gap-10 items-start">
          <div className="col-span-3">
            <p className="text-xl leading-relaxed text-gray-700 mb-6">
              O <strong>Itararé Pass</strong> é um Web App gamificado (PWA) desenhado para integrar os atrativos naturais de Itararé-SP ao comércio urbano. 
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
              Resolvemos o "turismo de passagem" através de um modelo de <strong>Economia Circular Reversa</strong>, onde a exploração da natureza gera descontos de até 25% no setor formal da cidade.
            </p>
          </div>
          <div className="col-span-2 relative aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-gray-100 shadow-xl bg-gray-100">
             <Image 
              src="https://picsum.photos/seed/itarare-print/800/600" 
              alt="Canyon Itararé" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* O Diferencial Econômico */}
      <section className="mb-12">
        <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-orange-600" /> 02. Modelo de Negócio (B2B2G)
        </h2>
        <div className="bg-orange-50 p-10 rounded-[3rem] border-2 border-orange-100 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 uppercase text-orange-900">Sustentabilidade e Margem</h3>
            <p className="text-orange-950/70 text-lg leading-relaxed mb-8">
              Implementamos o sistema de <strong>25% de desconto estratégico</strong>. Este modelo foca no item principal (diária ou prato), preservando a lucratividade do parceiro comercial em extras, enquanto gera dados valiosos para o governo.
            </p>
            <div className="flex gap-6">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-xs font-black uppercase">Fomento ao Comércio Formal</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-xs font-black uppercase">Inteligência Governamental</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <ShieldCheck className="w-64 h-64" />
          </div>
        </div>
      </section>

      <footer className="mt-32 pt-10 border-t-2 border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <p className="text-[12px] font-black uppercase tracking-[0.2em] ml-2 text-gray-400">Itararé Pass Startup Document</p>
        </div>
        <p className="text-[10px] font-black uppercase text-gray-300">© 2025 Itararé Pass - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
