"use client";

import React, { useMemo, createContext, useContext, useState } from "react";
import { useItarareAuth } from "./use-auth";
import { useItarareLocation } from "./use-location";
import { useItarareBusiness } from "./use-business";
import { AuthProvider } from "./use-auth";
import { LocationProvider } from "./use-location";
import { BusinessProvider } from "./use-business";
import { TouristSpot, Coupon } from "./use-business";
import { INITIAL_EVENTS, EMERGENCY_CONTACTS_DATA } from "@/lib/constants";

export type { TouristSpot, Coupon };

interface NavigationContextType {
  navDestination: TouristSpot | null;
  setNavDestination: (spot: TouristSpot | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navDestination, setNavDestination] = useState<TouristSpot | null>(null);
  return React.createElement(
    NavigationContext.Provider,
    { value: { navDestination, setNavDestination } },
    children
  );
}

export function ItarareProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    AuthProvider,
    null,
    React.createElement(
      LocationProvider,
      null,
      React.createElement(
        BusinessProvider,
        null,
        React.createElement(NavigationProvider, null, children)
      )
    )
  );
}

export function useItarare() {
  const auth = useItarareAuth();
  const location = useItarareLocation();
  const business = useItarareBusiness();
  const navContext = useContext(NavigationContext);

  if (!navContext) {
    throw new Error("useItarare deve ser usado dentro de um NavigationProvider");
  }

  const { navDestination, setNavDestination } = navContext;

  const startNavigation = (item: any) => {
    setNavDestination(item);
  };

  const events = useMemo(() => {
    return INITIAL_EVENTS.map((event) => ({
      ...event,
      title: business.t(`${event.id}_title`),
      description: business.t(`${event.id}_desc`),
      date: business.t(`${event.id}_date`),
      location: business.t(`${event.id}_loc`),
      category: business.t(`${event.id}_cat`),
    }));
  }, [business.language, business.t]);

  const emergencyContacts = useMemo(() => {
    return EMERGENCY_CONTACTS_DATA.map((contact) => ({
      ...contact,
      name: business.t(`${contact.id}_name`),
      description: business.t(`${contact.id}_desc`),
    }));
  }, [business.language, business.t]);

  return {
    ...auth,
    ...location,
    ...business,
    events,
    emergencyContacts,
    navDestination,
    setNavDestination,
    startNavigation,
  };
}
