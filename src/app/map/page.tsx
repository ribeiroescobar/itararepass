
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useItarare } from "@/hooks/use-itarare";
import { BottomNav } from "@/components/BottomNav";
import { getDistance } from "@/lib/haversine";
import { Navigation, WifiOff, Zap, MapPin, Compass, Crosshair, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const NavigationMap = dynamic(() => import("@/components/NavigationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background text-white/20">
      <div className="flex flex-col items-center gap-4">
        <MapIcon className="w-12 h-12 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-widest text-white/40">Sincronizando Mapas...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const { 
    userLocation, 
    navDestination, 
    setNavDestination, 
    spots, 
    demoMode, 
    simularCaminhada,
    isSimulating
  } = useItarare();

  const [distance, setDistance] = useState<string | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Calcula a distância sempre que a localização ou destino mudarem
  useEffect(() => {
    if (userLocation && navDestination) {
      const d = getDistance(userLocation.lat, userLocation.lng, navDestination.lat, navDestination.lng);
      setDistance(d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`);
    } else {
      setDistance(null);
    }
  }, [userLocation, navDestination]);

  const handleRecenter = () => {
    if (userLocation) {
      setRecenterTrigger(prev => prev + 1);
      toast({ title: "Centralizado", description: "Seguindo sua posição atual." });
    } else {
      toast({ variant: "destructive", title: "GPS Indisponível", description: "Aguardando sinal de satélite..." });
    }
  };

  const handleSimulate = () => {
    if (navDestination) {
      simularCaminhada(navDestination);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Interface Superior */}
      <div className="absolute top-6 left-6 right-6 z-[2000] space-y-3 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <div className="bg-[#0d1a14]/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl pointer-events-auto">
            <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <WifiOff className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">Rastreamento Ativo</p>
              <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">{userLocation ? 'Sinal Forte' : 'Buscando...'}</p>
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <Button 
              onClick={handleRecenter}
              size="icon"
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl h-10 w-10 shadow-xl"
            >
              <Crosshair className="w-4 h-4 text-white" />
            </Button>

            {demoMode && (
              <Button 
                onClick={handleSimulate}
                disabled={!navDestination || isSimulating}
                className="bg-primary hover:bg-primary/90 text-white font-black text-[9px] uppercase h-10 px-4 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 transition-all active:scale-95"
              >
                {isSimulating ? "Caminhando..." : <><Zap className="w-3 h-3 fill-white" /> Demo Run</>}
              </Button>
            )}
          </div>
        </div>

        {navDestination && (
          <div className="bg-[#1a2d24]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top-4 pointer-events-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase italic leading-none tracking-tight">{navDestination.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Compass className="w-3 h-3 text-white/30" />
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Traçado em Tempo Real</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white leading-none italic tracking-tighter">{distance || '--'}</p>
                <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1">Distância</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Container do Mapa */}
      <div className="flex-1 w-full h-full z-0">
        <NavigationMap 
          userLocation={userLocation} 
          destination={navDestination}
          allSpots={spots}
          recenterTrigger={recenterTrigger}
        />
      </div>

      {/* Interface Inferior - Escolha de Destino */}
      {!navDestination && (
        <div className="absolute bottom-28 left-6 right-6 z-[2000] animate-in fade-in slide-in-from-bottom-4 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Selecione um destino</h4>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {spots.filter(s => !s.visited).map(spot => (
                <button 
                  key={spot.id}
                  onClick={() => setNavDestination(spot)}
                  className="shrink-0 bg-white/5 hover:bg-primary/20 hover:border-primary/30 border border-white/5 px-5 py-3.5 rounded-2xl transition-all active:scale-95"
                >
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">{spot.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {navDestination && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[2000] pointer-events-auto">
          <Button 
            onClick={() => setNavDestination(null)}
            variant="ghost" 
            className="text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full px-8 h-10 border border-white/5 shadow-xl"
          >
            Limpar Rota
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
