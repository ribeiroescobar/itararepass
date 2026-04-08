"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Loader2, QrCode, Sparkles, ShieldCheck, Navigation, MessageSquare, ChevronRight, Star, Volume2, VolumeX, Lock } from "lucide-react";
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
    router.push('/map');
  };

  const handleValidateClick = () => {
    if (!user) {
      toast({ title: "Identificação necessária", description: "Faça login para registrar suas aventuras e ganhar prêmios!" });
      router.push('/login');
      return;
    }
    setShowScanner(true);
  };

  const handleQRScanSuccess = (code: string) => {
    if (demoMode || code === 'demo_success' || code === spot.id) {
      if (!demoMode) {
        if (!userLocation) {
          toast({ variant: "destructive", title: "GPS Indisponível" });
          return;
        }
        const distance = getDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
        if (distance > 0.30) {
          toast({ variant: "destructive", title: t('distance_block') });
          setShowScanner(false);
          return; 
        }
      }
      
      completeCheckIn();
      setShowScanner(false);
    } else {
      toast({ title: t('incorrect_token'), variant: "destructive" });
    }
  };

  const completeCheckIn = async () => {
    setLoading(true);
    try {
      let insightResult = "";
      try {
        const result = await generateLocationInsight({ 
          locationName: spot.name,
          language: language
        });
        insightResult = result.insight || t(`${spot.id}_snippet`);
      } catch (aiErr) {
        insightResult = t(`${spot.id}_snippet`);
      }
      
      await onCheckIn(spot.id, insightResult, language);
      toast({ title: t('checkin_complete') });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro ao registrar presença" });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = useCallback(async () => {
    if (isPlaying) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setIsPlaying(false);
      return;
    }

    // Lógica inteligente de idioma:
    // Se o insight salvo no banco estiver no mesmo idioma do app, usa ele (IA personalizada).
    // Se estiver em idioma diferente, usa o snippet estático traduzido para garantir compreensão.
    const textToSpeak = (spot.visited && spot.insightLanguage === language && spot.historicalSnippet)
      ? spot.historicalSnippet
      : t(`${spot.id}_snippet`);

    setLoadingAudio(true);
    try {
      const result = await textToSpeech({ text: textToSpeak, language: language });
      if (result.audioUri) {
        const audio = new Audio(result.audioUri);
        audioRef.current = audio;
        audio.onplay = () => { setLoadingAudio(false); setIsPlaying(true); };
        audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
        await audio.play();
      }
    } catch (err) {
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  }, [isPlaying, spot.historicalSnippet, spot.insightLanguage, spot.id, t, language]);

  return (
    <>
      <Card className={`overflow-hidden border-none rounded-[2.5rem] shadow-2xl flex flex-col transition-all duration-500 ${spot.visited ? 'bg-green-950/20' : 'bg-white/5'}`}>
        <div className="relative h-44 w-full">
          <Image src={spot.image} alt={spot.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleNavClick} className="bg-black/60 p-2.5 rounded-2xl border border-white/10 text-white"><Navigation className="w-4 h-4" /></button>
            <div className={`text-white text-[8px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase ${spot.type === 'lodging' ? 'bg-blue-600' : 'bg-primary'}`}>
              {spot.type === 'lodging' ? t('lodging') : t('adventure')}
            </div>
          </div>
        </div>
        
        <div className="p-6 flex flex-1 flex-col">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{spot.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(i => <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.round(spot.averageRating) ? 'fill-primary text-primary' : 'text-white/20'}`} />)}
                <span className="text-[9px] text-white/40 font-bold ml-1">{spot.averageRating}</span>
              </div>
            </div>
            {spot.visited && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2.5 bg-white/5 rounded-2xl border border-white/10 text-primary hover:bg-white/10 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] bg-[#0d1a14] border-t border-white/10 rounded-t-[3rem] overflow-hidden p-0">
                  <SheetHeader className="p-8 border-b border-white/5">
                    <SheetTitle className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                      {t('memories_title')}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="h-full overflow-y-auto p-8 no-scrollbar">
                    <SpotComments spotId={spot.id} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
          
          {spot.visited && (
            <div className="mb-6 p-4 bg-primary/10 rounded-2xl border border-primary/20 relative">
              <p className="text-[11px] text-white/80 leading-relaxed italic pr-10">
                "{(spot.insightLanguage === language && spot.historicalSnippet) ? spot.historicalSnippet : t(`${spot.id}_snippet`)}"
              </p>
              <button onClick={handleSpeak} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                {loadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3">
            {spot.visited ? (
              <Button className="w-full bg-green-600/20 text-green-500 border border-green-500/30 font-black h-12 rounded-2xl text-[10px] uppercase cursor-default">
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> {t('verified_visitor')}
              </Button>
            ) : (
              <Button 
                onClick={handleValidateClick}
                disabled={loading}
                className={`w-full text-white font-black h-12 rounded-2xl text-[10px] uppercase shadow-xl flex items-center justify-center gap-2 ${spot.type === 'lodging' ? 'bg-blue-600' : 'bg-primary'}`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : user ? <><QrCode className="w-4 h-4" /> {t('validate_checkin')}</> : <><Lock className="w-3.5 h-3.5" /> Entrar para Validar</>}
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
          targetId={spot.id} 
        />
      )}
    </>
  );
}
