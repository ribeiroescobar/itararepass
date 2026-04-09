
"use client";

import React, { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import { Calendar, MapPin, ChevronLeft, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { events, t, user, profile, isUserLoading } = useItarare();
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
    <div className="min-h-screen bg-[#0d1a14] pb-32 px-6">
      <header className="pt-10 pb-8 flex items-center gap-4">
        <Link href="/" className="p-3 bg-white/5 rounded-2xl border border-white/10">
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">{t('events')}</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{t('events_subtitle')}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group">
            <div className="relative h-48 w-full">
              <Image src={event.image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-white">
                {event.category}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{event.title}</h3>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] font-bold text-white/60 uppercase">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-[10px] font-bold text-white/60 uppercase">{event.location}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-medium">
                {event.description}
              </p>
              <button className="w-full bg-white/5 hover:bg-white/10 h-12 rounded-2xl border border-white/5 flex items-center justify-center gap-3 text-[10px] font-black text-white uppercase tracking-widest transition-all">
                <Ticket className="w-4 h-4 text-purple-500" />
                {t('view_event_details')}
              </button>
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
