"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const DEFAULT_REMOTE_API_BASE = "https://75.119.133.198.nip.io";

function getRemoteApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_REMOTE_API_BASE).replace(/\/$/, "");
}

function shouldRewriteRelativeApiCalls() {
  if (typeof window === "undefined") return false;

  const isNative = Capacitor.isNativePlatform();
  const host = window.location.hostname;

  return isNative || host === "localhost" || host === "127.0.0.1";
}

export function ClientRuntimeBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldRewriteRelativeApiCalls()) return;
    if ((window as any).__itarareFetchPatched) return;

    const remoteApiBase = getRemoteApiBaseUrl();
    const originalFetch = window.fetch.bind(window);

    const rewriteUrl = (value: string) => {
      if (!value.startsWith("/api/")) return value;
      return `${remoteApiBase}${value}`;
    };

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string") {
        return originalFetch(rewriteUrl(input), init);
      }

      if (input instanceof URL) {
        const nextUrl = rewriteUrl(input.toString());
        return originalFetch(nextUrl, init);
      }

      if (input instanceof Request) {
        const nextUrl = rewriteUrl(input.url);
        if (nextUrl === input.url) {
          return originalFetch(input, init);
        }

        const rewrittenRequest = new Request(nextUrl, input);
        return originalFetch(rewrittenRequest, init);
      }

      return originalFetch(input, init);
    }) as typeof window.fetch;

    (window as any).__itarareFetchPatched = true;
    (window as any).__itarareRemoteApiBase = remoteApiBase;
  }, []);

  return null;
}
