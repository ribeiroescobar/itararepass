"use client";

import React, { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import { Calendar, MapPin, ChevronLeft, Ticket, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { events, t, user, profile, isUserLoading, language } = useItarare();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!isUserLoading && user && profile?.role && profile.role !== "tourist") {
      router.replace(profile.role === "merchant" ? "/merchant/dashboard" : "/admin/dashboard");
    }
  }, [user, profile?.role, isUserLoading, router]);

  return (
    <div className="min-h-screen bg-[#0d1a14] pb-32 px-4 sm:px-6">
      <header className="pt-10 pb-8 flex items-center gap-4">
        <Link href="/explore" className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">{t("events")}</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{t("events_subtitle")}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-6 rounded-full bg-blue-400 shadow-lg shadow-blue-400/40" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight italic">
              {language === "en" ? "City Event Carousel" : "Carrossel de Eventos da Cidade"}
            </h2>
          </div>

          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="min-w-[86%] max-w-[86%] snap-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#12231c] shadow-2xl sm:min-w-[420px] sm:max-w-[420px]"
              >
                <div className="relative h-52 w-full">
                  <Image src={event.image} alt={event.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-blue-500/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white">
                    {event.category}
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{event.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] font-bold text-white/60 uppercase">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] font-bold text-white/60 uppercase">{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Sparkles className="w-5 h-5 text-blue-300" />
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-white/65">{event.description}</p>

                  <button className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white/10 flex items-center justify-center gap-3">
                    <Ticket className="w-4 h-4 text-blue-400" />
                    {t("view_event_details")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
