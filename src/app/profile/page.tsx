
"use client";

import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import { Button } from "@/components/ui/button";
import { 
  User, Gift, MapPin, Sparkles, CheckCircle2, LogOut, 
  ShieldCheck, Store, Calendar, Heart, HelpCircle, Phone, Mail 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, logout, t } = useItarare();

  const roleLabel = profile?.role === 'admin' ? 'Gestor Público' : profile?.role === 'merchant' ? 'Parceiro Comercial' : 'Turista';
  const roleIcon = profile?.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-blue-400" /> : profile?.role === 'merchant' ? <Store className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-green-400" />;

  return (
    <div className="min-h-screen pb-32 px-6">
      <header className="pt-10 pb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">{t('profile_title')}</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{t('profile_subtitle')}</p>
          </div>
        </div>
        
        <Button onClick={logout} variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl h-12 px-4 gap-2 text-[10px] font-black uppercase tracking-widest">
          <LogOut className="w-4 h-4" /> Sair
        </Button>
      </header>

      <main className="max-w-xl mx-auto space-y-6">
        {/* Badge de Nível de Acesso */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
              {roleIcon}
            </div>
            <div>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Status da Conta</p>
              <p className="text-xs font-black text-white uppercase">{roleLabel} • {profile?.approved ? 'Verificado' : 'Pendente'}</p>
            </div>
          </div>
          {profile?.role === 'tourist' && (
            <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-black text-green-500 uppercase">Premium</span>
            </div>
          )}
        </div>

        {/* Card de Conquista do Brinde */}
        <Card className="bg-green-950/20 border-green-500/20 p-8 rounded-[2.5rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
            <Gift className="w-24 h-24 text-green-500" />
          </div>
          
          <div className="w-16 h-16 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto border border-green-500/30 shadow-2xl shadow-green-500/20 relative z-10">
            <Sparkles className="w-8 h-8 text-green-500" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{t('profile_completed_title')}</h2>
            <p className="text-xs text-white/60 leading-relaxed mt-2">
              Parabéns, <strong>{profile?.name}</strong>! Seu passaporte digital está ativo.
              <br />
              Seu voucher para a <strong>Casa do Artesão</strong> foi desbloqueado!
            </p>
          </div>
          <div className="pt-4 flex items-center justify-center gap-4 relative z-10">
             <Link href="/coupons" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-600/20">
                  <Gift className="w-4 h-4 mr-2" /> Resgatar Meu Brinde
                </Button>
             </Link>
          </div>
        </Card>

        {/* Resumo dos Dados Coletados */}
        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Meus Dados</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-white/30" />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">E-mail</p>
                <p className="text-xs font-bold text-white/80">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white/30" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Origem</p>
                  <p className="text-xs font-bold text-white/80">{profile?.originCity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white/30" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">WhatsApp</p>
                  <p className="text-xs font-bold text-white/80">{profile?.whatsapp}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white/30" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Idade</p>
                  <p className="text-xs font-bold text-white/80">{profile?.ageGroup}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white/30" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Interesse</p>
                  <p className="text-xs font-bold text-white/80">{t(`interest_${profile?.interest}`)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white/30" />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Como nos conheceu</p>
                <p className="text-xs font-bold text-white/80 uppercase">{t(`source_${profile?.discoverySource}`)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-blue-950/20 border border-blue-500/10 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
             <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-tight">
            {t('privacy_note')}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
