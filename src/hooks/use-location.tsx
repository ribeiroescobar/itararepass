
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";

interface LocationContextType {
  userLocation: { lat: number; lng: number } | null;
  activeSpotId: string | null;
  setActiveSpotId: (id: string | null) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  simularCaminhada: (dest: { lat: number; lng: number }) => void;
  isSimulating: boolean;
}

const ITARARE_CENTER = { lat: -24.1114, lng: -49.3327 };

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito para gerenciar o GPS (Real ou Demo)
  useEffect(() => {
    if (demoMode) {
      // No modo demo, se ainda não houver localização, transporta para o centro de Itararé
      if (!userLocation) {
        setUserLocation(ITARARE_CENTER);
      }
      return;
    }

    // GPS REAL
    if (typeof navigator === 'undefined' || !("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!demoMode) {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }
      },
      (err) => console.warn("GPS Real Error:", err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [demoMode]);

  // Função para simular o movimento do turista até um ponto (Efeito visual no Pitch)
  const simularCaminhada = useCallback((dest: { lat: number; lng: number }) => {
    if (!userLocation) return;
    
    setIsSimulating(true);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    const steps = 60; // Número de passos da animação
    let currentStep = 0;
    const startLat = userLocation.lat;
    const startLng = userLocation.lng;

    simulationIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      const newLat = startLat + (dest.lat - startLat) * progress;
      const newLng = startLng + (dest.lng - startLng) * progress;
      
      setUserLocation({ lat: newLat, lng: newLng });

      if (currentStep >= steps) {
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        setIsSimulating(false);
      }
    }, 100); // 10 fps para suavidade
  }, [userLocation]);

  const value = useMemo(() => ({
    userLocation,
    activeSpotId,
    setActiveSpotId,
    demoMode,
    setDemoMode,
    simularCaminhada,
    isSimulating
  }), [userLocation, activeSpotId, demoMode, isSimulating, simularCaminhada]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useItarareLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) throw new Error("useItarareLocation must be used within a LocationProvider");
  return context;
}
