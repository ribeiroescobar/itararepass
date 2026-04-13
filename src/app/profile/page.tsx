"use client";

import React from "react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import { Button } from "@/components/ui/button";
import {
  User,
  Gift,
  MapPin,
  Sparkles,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Store,
  Calendar,
  Heart,
  HelpCircle,
  Phone,
  Mail,
  Building2,
  Briefcase,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function ProfileInfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 sm:gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{label}</p>
        <p className="break-words text-sm font-bold leading-snug text-white/80">{value || "-"}</p>
      </div>
    </div>
  );
}

function translateAge(ageGroup?: string, language?: "pt" | "en") {
  const map: Record<string, { pt: string; en: string }> = {
    "18-25": { pt: "18 a 25 anos", en: "18 to 25" },
    "26-35": { pt: "26 a 35 anos", en: "26 to 35" },
    "36-50": { pt: "36 a 50 anos", en: "36 to 50" },
    "50+": { pt: "Acima de 50 anos", en: "Over 50" },
  };

  if (!ageGroup) return undefined;
  return map[ageGroup]?.[language === "en" ? "en" : "pt"] || ageGroup;
}

function translateDiscoverySource(source?: string, language?: "pt" | "en") {
  const map: Record<string, { pt: string; en: string }> = {
    "social-media": { pt: "Redes Sociais", en: "Social Media" },
    friends: { pt: "Amigos/Familia", en: "Friends/Family" },
    google: { pt: "Pesquisa Online", en: "Search Engine" },
    "travel-agency": { pt: "Agencia de Turismo", en: "Travel Agency" },
    other: { pt: "Outros", en: "Other" },
  };

  if (!source) return undefined;
  return map[source]?.[language === "en" ? "en" : "pt"] || source;
}

export default function ProfilePage() {
  const { profile, logout, t, coupons, language } = useItarare();

  const isMaster = profile?.tipo_usuario === "admin_master";
  const isMerchant = profile?.role === "merchant";
  const isTourist = profile?.role === "tourist";
  const isGovernment = profile?.role === "admin" && !isMaster;
  const artisanReward = coupons.find((coupon) => coupon.translationKey === "c_artesao");
  const showTouristGift = isTourist && artisanReward && !artisanReward.claimed && !artisanReward.used && !artisanReward.locked;

  const copy = language === "en"
    ? {
        accountStatus: "Account Status",
        verified: "Verified",
        pending: "Pending",
        tourist: "Traveler",
        merchant: "Business Partner",
        government: "Municipal Management",
        master: "Master Admin",
        benefitBadge: "Active Benefits",
        personalData: "Traveler Data",
        businessData: "Business Data",
        governmentData: "Institutional Data",
        internalArea: "Internal Area",
        internalDescription: "This is an internal access profile used for approvals, premium management and global supervision.",
        internalPlaceholder: "Operational account reserved for platform administration.",
        rewardTitle: "Profile Benefit Ready",
        rewardMessage: `Congratulations, ${profile?.name || ""}! Your Artisan House reward is available in your wallet.`,
        rewardButton: "Redeem My Gift",
        email: "Email",
        origin: "Origin",
        whatsapp: "WhatsApp",
        age: "Age Group",
        interest: "Interest",
        discovery: "How you found us",
        businessName: "Business Name",
        cnpj: "Tax ID",
        contact: "Main Contact",
        position: "Role",
        institution: "Institution",
      }
    : {
        accountStatus: "Status da Conta",
        verified: "Verificado",
        pending: "Pendente",
        tourist: "Turista",
        merchant: "Parceiro Comercial",
        government: "Gestao Municipal",
        master: "Admin Master",
        benefitBadge: "Beneficios Ativos",
        personalData: "Dados do Viajante",
        businessData: "Dados do Negocio",
        governmentData: "Dados Institucionais",
        internalArea: "Area Interna",
        internalDescription: "Este e um perfil interno usado para aprovacoes, liberacao de premium e supervisao global da plataforma.",
        internalPlaceholder: "Conta operacional reservada para administracao da plataforma.",
        rewardTitle: "Beneficio do Perfil Liberado",
        rewardMessage: `Parabens, ${profile?.name || ""}! Seu voucher da Casa do Artesao esta disponivel na carteira.`,
        rewardButton: "Resgatar Meu Brinde",
        email: "E-mail",
        origin: "Origem",
        whatsapp: "WhatsApp",
        age: "Faixa Etaria",
        interest: "Interesse",
        discovery: "Como nos conheceu",
        businessName: "Nome da Empresa",
        cnpj: "CNPJ",
        contact: "Responsavel",
        position: "Cargo",
        institution: "Instituicao",
      };

  const roleLabel = isMaster
    ? copy.master
    : isGovernment
      ? copy.government
      : isMerchant
        ? copy.merchant
        : copy.tourist;

  const roleIcon = isMaster
    ? <ShieldCheck className="w-4 h-4 text-purple-400" />
    : isGovernment
      ? <Building2 className="w-4 h-4 text-blue-400" />
      : isMerchant
        ? <Store className="w-4 h-4 text-primary" />
        : <User className="w-4 h-4 text-green-400" />;

  return (
    <div className="min-h-screen px-4 pb-32 sm:px-6">
      <header className="flex flex-col gap-4 pb-8 pt-8 sm:flex-row sm:items-center sm:justify-between sm:pt-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">{t("profile_title")}</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{roleLabel}</p>
          </div>
        </div>

        <Button
          onClick={logout}
          variant="ghost"
          className="h-12 w-full gap-2 rounded-xl bg-red-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 sm:w-auto"
        >
          <LogOut className="w-4 h-4" /> {language === "en" ? "Logout" : "Sair"}
        </Button>
      </header>

      <main className="max-w-xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
              {roleIcon}
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/30">{copy.accountStatus}</p>
              <p className="break-words text-xs font-black uppercase leading-snug text-white">
                {roleLabel} - {profile?.approved ? copy.verified : copy.pending}
              </p>
            </div>
          </div>
          {isTourist && (
            <div className="flex w-fit items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-black uppercase text-green-500">{copy.benefitBadge}</span>
            </div>
          )}
        </div>

        {showTouristGift && (
          <Card className="bg-green-950/20 border-green-500/20 p-8 rounded-[2.5rem] text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
              <Gift className="w-24 h-24 text-green-500" />
            </div>

            <div className="w-16 h-16 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto border border-green-500/30 shadow-2xl shadow-green-500/20 relative z-10">
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{copy.rewardTitle}</h2>
              <p className="text-xs text-white/60 leading-relaxed mt-2">{copy.rewardMessage}</p>
            </div>
            <div className="pt-4 relative z-10">
              <Link href="/coupons" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-600/20">
                  <Gift className="w-4 h-4 mr-2" /> {copy.rewardButton}
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {isTourist && (
          <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-5 shadow-2xl sm:rounded-[3rem] sm:p-8">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{copy.personalData}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ProfileInfoCard icon={<Mail className="w-4 h-4 text-white/30" />} label={copy.email} value={profile?.email} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfoCard icon={<MapPin className="w-4 h-4 text-white/30" />} label={copy.origin} value={profile?.originCity} />
                <ProfileInfoCard icon={<Phone className="w-4 h-4 text-white/30" />} label={copy.whatsapp} value={profile?.whatsapp} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfoCard icon={<Calendar className="w-4 h-4 text-white/30" />} label={copy.age} value={translateAge(profile?.ageGroup, language)} />
                <ProfileInfoCard icon={<Heart className="w-4 h-4 text-white/30" />} label={copy.interest} value={profile?.interest ? t(`interest_${profile.interest}`) : undefined} />
              </div>
              <ProfileInfoCard
                icon={<HelpCircle className="w-4 h-4 text-white/30" />}
                label={copy.discovery}
                value={translateDiscoverySource(profile?.discoverySource, language)}
              />
            </div>
          </section>
        )}

        {isMerchant && (
          <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-5 shadow-2xl sm:rounded-[3rem] sm:p-8">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{copy.businessData}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ProfileInfoCard icon={<Building2 className="w-4 h-4 text-white/30" />} label={copy.businessName} value={profile?.businessName || profile?.name} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfoCard icon={<Mail className="w-4 h-4 text-white/30" />} label={copy.email} value={profile?.email} />
                <ProfileInfoCard icon={<Phone className="w-4 h-4 text-white/30" />} label={copy.whatsapp} value={profile?.whatsapp} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfoCard icon={<Briefcase className="w-4 h-4 text-white/30" />} label={copy.contact} value={profile?.name} />
                <ProfileInfoCard icon={<ShieldCheck className="w-4 h-4 text-white/30" />} label={copy.cnpj} value={profile?.cnpj} />
              </div>
            </div>
          </section>
        )}

        {isGovernment && (
          <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-5 shadow-2xl sm:rounded-[3rem] sm:p-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{copy.governmentData}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ProfileInfoCard icon={<Building2 className="w-4 h-4 text-white/30" />} label={copy.institution} value={profile?.name} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInfoCard icon={<Mail className="w-4 h-4 text-white/30" />} label={copy.email} value={profile?.email} />
                <ProfileInfoCard icon={<Phone className="w-4 h-4 text-white/30" />} label={copy.whatsapp} value={profile?.whatsapp} />
              </div>
              <ProfileInfoCard icon={<Briefcase className="w-4 h-4 text-white/30" />} label={copy.position} value={profile?.position} />
            </div>
          </section>
        )}

        {isMaster && (
          <section className="space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-5 shadow-2xl sm:rounded-[3rem] sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{copy.internalArea}</h3>
            </div>

            <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 space-y-3">
              <p className="text-sm text-white/70 leading-relaxed">{copy.internalDescription}</p>
              <p className="text-xs text-white/40 uppercase tracking-widest">{copy.internalPlaceholder}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ProfileInfoCard icon={<Mail className="w-4 h-4 text-white/30" />} label={copy.email} value={profile?.email} />
              <ProfileInfoCard icon={<Briefcase className="w-4 h-4 text-white/30" />} label={copy.position} value={copy.master} />
            </div>
          </section>
        )}

        <div className="flex items-start gap-4 rounded-[2rem] border border-blue-500/10 bg-blue-950/20 p-5 sm:items-center sm:p-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-white/40 font-medium leading-relaxed uppercase tracking-tight">
            {t("privacy_note")}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

