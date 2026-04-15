"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "itarare_pwa_install_prompt_dismissed_v1";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const standaloneByMedia = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const standaloneByNavigator = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneByMedia || standaloneByNavigator;
}

function detectClient() {
  if (typeof window === "undefined") {
    return {
      isIos: false,
      isSafari: false,
      isStandalone: false,
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = isIos && /safari/.test(ua) && !/crios|fxios|edgios|opios/.test(ua);

  return {
    isIos,
    isSafari,
    isStandalone: isStandaloneMode(),
  };
}

export function PwaInstallPrompt() {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const wasDismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);
    setMounted(true);
  }, []);

  const client = useMemo(() => detectClient(), [mounted]);

  if (!mounted || dismissed || client.isStandalone || !client.isIos) {
    return null;
  }

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-[95] mx-auto w-auto max-w-md">
      <div className="rounded-[2rem] border border-white/10 bg-[#10241c]/95 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/15 text-primary">
              {client.isSafari ? <Share2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">Modo iPhone</p>
              <h3 className="mt-1 text-base font-black uppercase italic tracking-tight text-white">Instalar Como App</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:text-white"
            aria-label="Fechar aviso de instalacao"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
          {client.isSafari ? (
            <>
              <p>Para testar como app no iPhone, toque em Compartilhar e depois em Adicionar a Tela de Inicio.</p>
              <p>Depois abra o Itarare Pass pelo icone instalado para ter uma experiencia mais proxima do aplicativo.</p>
            </>
          ) : (
            <>
              <p>No iPhone, a instalacao como app precisa ser feita pelo Safari.</p>
              <p>Abra este link no Safari e use Compartilhar para adicionar o Itarare Pass a Tela de Inicio.</p>
            </>
          )}
        </div>

        <Button
          onClick={handleDismiss}
          className="mt-5 h-12 w-full rounded-[1.5rem] bg-primary text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90"
        >
          Entendi
        </Button>
      </div>
    </div>
  );
}
