"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, ShieldCheck, Sparkles, Tag, Wallet } from "lucide-react";
import { CouponCard } from "@/components/CouponCard";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useItarare } from "@/hooks/use-itarare";

type ActiveCouponQr = {
  token: string;
  alreadyClaimed: boolean;
  expiresInMinutes: number;
  coupon: {
    id: string;
    title: string;
    discount: string;
    businessName: string;
  };
};

export default function CouponsPage() {
  const { coupons, useCoupon, t, user, profile, isUserLoading, language } = useItarare();
  const router = useRouter();
  const [activeQr, setActiveQr] = useState<ActiveCouponQr | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!isUserLoading && user && profile?.role && profile.role !== "tourist") {
      router.replace(profile.role === "merchant" ? "/merchant/dashboard" : "/admin/dashboard");
    }
  }, [user, profile?.role, isUserLoading, router]);

  const handleUseCoupon = async (id: string) => {
    try {
      const result = await useCoupon(id);
      if (!result) return;

      setActiveQr(result);
      toast({
        title: t(result.alreadyClaimed ? "coupon_qr_refreshed" : "coupon_qr_generated"),
        description: t("show_to_attendant"),
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("coupon_qr_error"),
        description: err?.message || "Erro ao gerar QR do beneficio.",
      });
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-24 sm:px-6 md:px-8">
      <header className="pb-10 pt-8">
        <div className="mb-2 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-accent/30 bg-accent/20 shadow-xl shadow-accent/5">
            <Wallet className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h1 className="leading-none text-3xl font-black uppercase tracking-tighter text-white">{t("my_wallet")}</h1>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white/50">
              <Tag className="h-3 w-3" />
              {t("unlocked_rewards")}
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {coupons.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} onUse={handleUseCoupon} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border border-white/10 bg-white/5 px-8 py-24 text-center shadow-inner">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/5 bg-white/5">
                <Info className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-white">{t("empty_wallet")}</h3>
              <p className="max-w-[250px] text-sm text-white/40">{t("empty_wallet_desc")}</p>
            </div>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-accent to-orange-600 p-8 text-white shadow-2xl shadow-accent/20">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>

            <h4 className="mb-4 text-sm font-black uppercase tracking-widest">{t("expert_tip")}</h4>
            <p className="mb-6 text-sm font-medium leading-relaxed opacity-90">"{t("expert_tip_text")}"</p>

            <div className="flex items-center justify-between border-t border-white/20 pt-6">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60">{t("next_goal")}</p>
                <p className="text-xl font-black italic">5 {t("checkins")}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Dialog open={!!activeQr} onOpenChange={(open) => !open && setActiveQr(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0f1f18] p-0 text-white shadow-2xl">
          {activeQr && (
            <div className="overflow-hidden rounded-[2rem]">
              <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                <button
                  type="button"
                  onClick={() => setActiveQr(null)}
                  className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {language === "en" ? "Back" : "Voltar"}
                </button>

                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">
                    {t("coupon_qr_title")}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed text-white/60">
                    {t("coupon_qr_description")}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="rounded-[1.75rem] border border-primary/20 bg-black/30 p-5 text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=420x420&qzone=2&data=${encodeURIComponent(activeQr.token)}`}
                    alt={language === "en" ? "Reward QR code" : "QR do beneficio"}
                    className="mx-auto h-[min(78vw,320px)] w-[min(78vw,320px)] rounded-2xl bg-white p-3 shadow-xl"
                  />
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {activeQr.coupon.businessName}
                  </p>
                  <p className="mt-1 text-lg font-black italic text-white">{activeQr.coupon.discount}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">{activeQr.coupon.title}</p>
                </div>

                <div className="flex items-start gap-3 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                    {t("coupon_qr_expiration").replace("{count}", String(activeQr.expiresInMinutes))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
      <Toaster />
    </div>
  );
}

const Trophy = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
