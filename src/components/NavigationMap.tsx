
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TouristSpot } from "@/hooks/use-itarare";
import { getDistance } from "@/lib/haversine";

interface NavigationMapProps {
  userLocation: { lat: number; lng: number } | null;
  destination: TouristSpot | null;
  allSpots: TouristSpot[];
  recenterTrigger?: number;
}

function MapController({ 
  userPos, 
  destPos, 
  recenterTrigger 
}: { 
  userPos: [number, number] | null; 
  destPos: [number, number] | null;
  recenterTrigger: number;
}) {
  const map = useMap();
  const initialCentered = useRef(false);

  useEffect(() => {
    if (userPos && !initialCentered.current) {
      map.setView(userPos, 14);
      initialCentered.current = true;
    }
  }, [userPos, map]);

  useEffect(() => {
    if (userPos && recenterTrigger > 0) {
      map.flyTo(userPos, 16, { duration: 1.5 });
    }
  }, [recenterTrigger, userPos, map]);

  useEffect(() => {
    if (destPos && userPos) {
      const bounds = L.latLngBounds([userPos, destPos]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    } else if (destPos) {
      map.flyTo(destPos, 15);
    }
  }, [destPos, userPos, map]);

  return null;
}

export default function NavigationMap({ userLocation, destination, allSpots, recenterTrigger = 0 }: NavigationMapProps) {
  const [osrmRoute, setOsrmRoute] = useState<[number, number][]>([]);
  const [isStraightLine, setIsStraightLine] = useState(true);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  // Ref para evitar chamadas excessivas à API e flickering do loader
  const lastFetchRef = useRef<{lat: number, lng: number, destId: string} | null>(null);

  const defaultCenter: [number, number] = [-24.1114, -49.3327]; 
  
  const userPos = useMemo(() => {
    return userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : null;
  }, [userLocation?.lat, userLocation?.lng]);

  const destPos = useMemo(() => {
    return destination ? [destination.lat, destination.lng] as [number, number] : null;
  }, [destination?.lat, destination?.lng]);

  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;

    return {
      user: L.divIcon({
        html: `<div class="user-marker-static">
                <div class="user-marker-pulse"></div>
                <div class="user-marker-core"></div>
              </div>`,
        className: "custom-user-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
      destination: L.divIcon({
        html: `<div class="dest-marker-container">
                <div class="dest-marker-bounce">
                  <div class="w-10 h-10 bg-[#f97316] rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                    <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>`,
        className: "dest-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
      spot: (visited: boolean) => L.divIcon({
        html: `<div class="w-6 h-6 ${visited ? 'bg-green-500' : 'bg-white/20'} rounded-full border-2 border-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-white rounded-full opacity-50"></div>
              </div>`,
        className: "spot-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
    };
  }, []);

  useEffect(() => {
    if (!userLocation || !destination) {
      setOsrmRoute([]);
      setIsStraightLine(true);
      lastFetchRef.current = null;
      return;
    }

    // Lógica para evitar re-fetch por micro-movimentos (menos de 30 metros)
    const lastFetch = lastFetchRef.current;
    const distanceMoved = lastFetch 
      ? getDistance(userLocation.lat, userLocation.lng, lastFetch.lat, lastFetch.lng)
      : 999;

    if (lastFetch?.destId === destination.id && distanceMoved < 0.03) {
      return;
    }

    const fetchRoute = async () => {
      const isInitialFetch = lastFetch?.destId !== destination.id;
      
      // Só mostra o loader intrusivo no primeiro carregamento do destino
      if (isInitialFetch) {
        setIsLoadingRoute(true);
      }

      lastFetchRef.current = { lat: userLocation.lat, lng: userLocation.lng, destId: destination.id };

      const cacheKey = `itarare_route_${destination.id}`;
      
      try {
        const profiles = ['foot', 'driving'];
        let foundRoute = false;

        for (const profile of profiles) {
          const url = `https://router.project-osrm.org/route/v1/${profile}/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&radiuses=3000;3000`;
          
          const res = await fetch(url);
          const data = await res.json();

          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
            
            if (coords.length > 1) {
              setOsrmRoute(coords);
              setIsStraightLine(false);
              foundRoute = true;
              localStorage.setItem(cacheKey, JSON.stringify(coords));
              break;
            }
          }
        }

        if (!foundRoute) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setOsrmRoute(JSON.parse(cached));
            setIsStraightLine(false);
          } else {
            setOsrmRoute([]);
            setIsStraightLine(true);
          }
        }
      } catch (e) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setOsrmRoute(JSON.parse(cached));
          setIsStraightLine(false);
        } else {
          setOsrmRoute([]);
          setIsStraightLine(true);
        }
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [userLocation?.lat, userLocation?.lng, destination?.id]);

  const routePositions = useMemo(() => {
    if (!userPos || !destPos) return [];
    if (osrmRoute.length > 0) return [userPos, ...osrmRoute, destPos];
    return [userPos, destPos];
  }, [userPos, osrmRoute, destPos]);

  if (!icons) return null;

  return (
    <div className="w-full h-full relative bg-[#0d2a1f]">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap'
        />
        <MapController 
          userPos={userPos} 
          destPos={destPos} 
          recenterTrigger={recenterTrigger} 
        />

        {routePositions.length > 1 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ 
              color: isStraightLine ? '#ffffff33' : '#f97316', 
              weight: isStraightLine ? 2 : 6, 
              opacity: isStraightLine ? 0.5 : 1,
              lineJoin: 'round',
              lineCap: 'round',
              dashArray: isStraightLine ? '10, 15' : undefined 
            }} 
          />
        )}

        {userPos && <Marker position={userPos} icon={icons.user} zIndexOffset={1000} />}

        {allSpots.map(spot => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lng]} 
            icon={destination?.id === spot.id ? icons.destination : icons.spot(spot.visited)}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-center min-w-[100px]">
                <p className="font-black text-xs text-black uppercase leading-tight">{spot.name}</p>
                <p className="text-[9px] text-black/50 font-bold uppercase mt-1">
                  {spot.type === 'lodging' ? 'Hotel Oficial' : 'Atrativo Natural'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isLoadingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3000] bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Calculando Rota Real...</p>
        </div>
      )}

      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
        }
        .dest-marker-bounce {
          animation: bounce-marker 2s infinite ease-in-out;
        }
        @keyframes bounce-marker {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
