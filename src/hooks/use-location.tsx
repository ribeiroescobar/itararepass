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
  locationError: string | null;
}

const ITARARE_CENTER = { lat: -24.1114, lng: -49.3327 };

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (demoMode) {
      if (!userLocation) {
        setUserLocation(ITARARE_CENTER);
      }
      setLocationError(null);
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationError("Este dispositivo nao oferece suporte a geolocalizacao.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!demoMode) {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        }
      },
      (err) => {
        console.warn("GPS Real Error:", err);
        const nextMessage =
          err.code === 1
            ? "Permissao de localizacao negada. Libere o GPS nas configuracoes do app."
            : err.code === 2
              ? "Nao foi possivel obter sua localizacao agora."
              : "O GPS esta indisponivel no momento.";
        setLocationError(nextMessage);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [demoMode, userLocation]);

  const simularCaminhada = useCallback((dest: { lat: number; lng: number }) => {
    if (!userLocation) return;

    setIsSimulating(true);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);

    const steps = 60;
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
    }, 100);
  }, [userLocation]);

  const value = useMemo(
    () => ({
      userLocation,
      activeSpotId,
      setActiveSpotId,
      demoMode,
      setDemoMode,
      simularCaminhada,
      isSimulating,
      locationError,
    }),
    [userLocation, activeSpotId, demoMode, isSimulating, simularCaminhada, locationError]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useItarareLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) throw new Error("useItarareLocation must be used within a LocationProvider");
  return context;
}
