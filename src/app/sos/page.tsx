
"use client";

import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import { ShieldAlert, Phone, ChevronLeft, HeartPulse, Info } from "lucide-react";
import Link from "next/link";

export default function SOSPage() {
  const { emergencyContacts, t } = useItarare();

  return (
    <div className="min-h-screen bg-[#0d1a14] pb-32 px-6">
      <header className="pt-10 pb-8 flex items-center gap-4">
        <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">{t('sos')}</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{t('sos_subtitle')}</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2.5rem] flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-xs text-white/70 leading-relaxed font-medium">
            {t('sos_warning')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {emergencyContacts.map((contact) => (
            <a 
              key={contact.id} 
              href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
              className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <Phone className="w-6 h-6 text-white/40 group-hover:text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">{contact.name}</h3>
                  <p className="text-[10px] text-white/30 font-bold uppercase mt-1">{contact.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-red-500 italic tracking-tighter">{contact.phone}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[3rem] space-y-4">
           <div className="flex items-center gap-3">
             <Info className="w-5 h-5 text-blue-500" />
             <h4 className="text-sm font-black text-white uppercase">{t('safety_tips_title')}</h4>
           </div>
           <ul className="space-y-3">
             {[t('tip_1'), t('tip_2'), t('tip_3'), t('tip_4')].map((tip, i) => (
               <li key={i} className="flex gap-3 text-[11px] text-white/40 font-medium leading-relaxed">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                 {tip}
               </li>
             ))}
           </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
