"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MapPin,
  Loader2,
  QrCode,
  Sparkles,
  ShieldCheck,
  Navigation,
  MessageSquare,
  Star,
  Volume2,
  VolumeX,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TouristSpot, useItarare } from "@/hooks/use-itarare";
import { getDistance } from "@/lib/haversine";
import { generateLocationInsight } from "@/ai/flows/generate-location-insight";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { toast } from "@/hooks/use-toast";
import { QRScanner } from "@/components/QRScanner";
import { SpotComments } from "@/components/SpotComments";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CheckInCardProps {
  spot: TouristSpot;
  onCheckIn: (id: string, insight?: string, lang?: string) => Promise<void>;
  userLocation: { lat: number; lng: number } | null;
}

export function CheckInCard({ spot, onCheckIn, userLocation }: CheckInCardProps) {
  const router = useRouter();
  const { user, startNavigation, t, language, demoMode } = useItarare();
  const [loading, setLoading] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startNavigation(spot);
    router.push("/map");
  };

  const handleValidateClick = () => {
    if (!user) {
      toast({
        title: "Identificacao necessaria",
        description: "Faca login para registrar suas aventuras e ganhar premios!",
      });
      router.push("/login");
      return;
    }
    setShowScanner(true);
  };

  const completeCheckIn = async () => {
    setLoading(true);
    try {
      let insightResult = "";
      try {
        const result = await generateLocationInsight({
          locationName: spot.name,
          language,
        });
        insightResult = result.insight || t(`${spot.id}_snippet`);
      } catch {
        insightResult = t(`${spot.id}_snippet`);
      }

      await onCheckIn(spot.id, insightResult, language);
      toast({ title: t("checkin_complete") });
    } catch {
      toast({ variant: "destructive", title: "Erro ao registrar presenca" });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = (code: string) => {
    void (async () => {
      if (demoMode && code === "demo_success") {
        await completeCheckIn();
        setShowScanner(false);
        return;
      }

      try {
        const verifyRes = await fetch("/api/checkins/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: code, spotId: spot.id }),
        });
        const verifyData = await verifyRes.json().catch(() => null);

        if (!verifyRes.ok) {
          throw new Error(verifyData?.error || t("incorrect_token"));
        }

        if (!demoMode) {
          if (!userLocation) {
            toast({ variant: "destructive", title: "GPS Indisponivel" });
            return;
          }

          const distance = getDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
          if (distance > 0.3) {
            toast({ variant: "destructive", title: t("distance_block") });
            setShowScanner(false);
            return;
          }
        }

        await completeCheckIn();
        setShowScanner(false);
      } catch (err: any) {
        toast({ title: err?.message || t("incorrect_token"), variant: "destructive" });
      }
    })();
  };

  const handleSpeak = useCallback(async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const textToSpeak =
      spot.visited && spot.insightLanguage === language && spot.historicalSnippet
        ? spot.historicalSnippet
        : t(`${spot.id}_snippet`);

    setLoadingAudio(true);
    try {
      const result = await textToSpeech({ text: textToSpeak, language });
      if (result.audioUri) {
        const audio = new Audio(result.audioUri);
        audioRef.current = audio;
        audio.onplay = () => {
          setLoadingAudio(false);
          setIsPlaying(true);
        };
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        await audio.play();
      }
    } catch {
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  }, [isPlaying, spot.visited, spot.insightLanguage, spot.historicalSnippet, spot.id, language, t]);

  return (
    <>
      <Card
        className={`flex flex-col overflow-hidden rounded-[2.5rem] border-none shadow-2xl transition-all duration-500 ${
          spot.visited ? "bg-green-950/20" : "bg-white/5"
        }`}
      >
        <div className="relative h-44 w-full">
          <Image src={spot.image} alt={spot.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={handleNavClick}
              className="rounded-2xl border border-white/10 bg-black/60 p-2.5 text-white"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-black uppercase text-white ${
                spot.type === "lodging" ? "bg-blue-600" : "bg-primary"
              }`}
            >
              {spot.type === "lodging" ? t("lodging") : t("adventure")}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">{spot.name}</h3>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i <= Math.round(spot.averageRating) ? "fill-primary text-primary" : "text-white/20"}`}
                  />
                ))}
                <span className="ml-1 text-[9px] font-bold text-white/40">{spot.averageRating}</span>
              </div>
            </div>
            {spot.visited && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-primary transition-colors hover:bg-white/10">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-hidden rounded-t-[3rem] border-t border-white/10 bg-[#0d1a14] p-0">
                  <SheetHeader className="border-b border-white/5 p-8">
                    <SheetTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter text-white italic">
                      <Sparkles className="w-6 h-6 text-primary" />
                      {t("memories_title")}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="no-scrollbar h-full overflow-y-auto p-8">
                    <SpotComments spotId={spot.id} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {spot.visited && (
            <div className="relative mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="pr-10 text-[11px] italic leading-relaxed text-white/80">
                "
                {spot.insightLanguage === language && spot.historicalSnippet
                  ? spot.historicalSnippet
                  : t(`${spot.id}_snippet`)}
                "
              </p>
              <button
                onClick={handleSpeak}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary"
              >
                {loadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            {spot.visited ? (
              <Button className="h-12 w-full cursor-default rounded-2xl border border-green-500/30 bg-green-600/20 text-[10px] font-black uppercase text-green-500">
                <ShieldCheck className="mr-2 w-3.5 h-3.5" /> {t("verified_visitor")}
              </Button>
            ) : (
              <Button
                onClick={handleValidateClick}
                disabled={loading}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase text-white shadow-xl ${
                  spot.type === "lodging" ? "bg-blue-600" : "bg-primary"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : user ? (
                  <>
                    <QrCode className="w-4 h-4" /> {t("validate_checkin")}
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Entrar para Validar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {showScanner && (
        <QRScanner
          onScan={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
          targetName={spot.name}
          demoMode={demoMode}
          targetId="any"
        />
      )}
    </>
  );
}
