"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Loader2, ShieldAlert, X, Zap } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  targetName: string;
  demoMode: boolean;
  targetId: string;
  themeColor?: string;
  title?: string;
  scanHint?: string;
}

export function QRScanner({
  onScan,
  onClose,
  targetName,
  targetId,
  demoMode,
  themeColor = "#f97316",
  title = "Validacao de Local",
  scanHint = "Aponte para o QR Code oficial localizado no atrativo turistico.",
}: QRScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef(false);
  const scanRegionId = "qr-reader-region";

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (isMounted && cameras && cameras.length > 0) {
          setHasCameraPermission(true);
          const html5QrCode = new Html5Qrcode(scanRegionId);
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 20, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isMounted && !isHandlingScanRef.current) {
                handleScanSuccess(decodedText.trim());
              }
            },
            () => {}
          );
          if (isMounted) {
            setIsInitializing(false);
          }
        } else if (isMounted) {
          setHasCameraPermission(false);
          setIsInitializing(false);
        }
      } catch {
        if (isMounted) {
          setHasCameraPermission(false);
          setIsInitializing(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScanSuccess = (decodedText: string) => {
    isHandlingScanRef.current = true;
    setScanning(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }
    onScan(decodedText);
    setTimeout(() => {
      isHandlingScanRef.current = false;
      if (!isInitializing) {
        setScanning(false);
      }
    }, 2000);
  };

  const handleDemoBypass = () => {
    handleScanSuccess(targetId === "any" ? "demo_success" : targetId);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/98 backdrop-blur-2xl">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-black/70 p-4 backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Camera className="h-5 w-5 text-white/60" />
          </div>
          <div>
            <h2 className="leading-none text-lg font-black uppercase tracking-tighter text-white italic sm:text-xl">{title}</h2>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">Escaneando: {targetName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl text-white/40 hover:text-white">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl flex-col items-center justify-center p-6 sm:p-8">
        <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border-2 border-white/10 bg-black shadow-2xl sm:rounded-[3rem]">
          <div id={scanRegionId} className="h-full w-full" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[200px] w-[200px] animate-pulse rounded-3xl border-2 border-primary/40" style={{ borderColor: `${themeColor}66` }} />
          </div>

          {(scanning || isInitializing) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white">Iniciando lente...</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-6 pb-10">
          {hasCameraPermission === false && !demoMode && (
            <Alert variant="destructive" className="rounded-3xl border-red-500/20 bg-red-950/20">
              <ShieldAlert className="mb-2 h-5 w-5" />
              <AlertTitle className="text-xs font-black uppercase text-white">Camera nao detectada</AlertTitle>
              <AlertDescription className="text-[10px] text-white/50">
                Permita o acesso a camera nas configuracoes do seu navegador ou dispositivo.
              </AlertDescription>
            </Alert>
          )}

          {demoMode && (
            <Button
              onClick={handleDemoBypass}
              className="flex h-16 items-center gap-3 rounded-[2rem] border-2 border-white/10 bg-red-600 px-8 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-red-600/20 animate-bounce hover:bg-red-700"
            >
              <Zap className="h-4 w-4 fill-white" />
              Pular scan (usar no pitch)
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          <p className="max-w-sm text-center text-[10px] font-bold uppercase tracking-widest text-white/30">
            {demoMode ? "Modo demo ativo: use o botao acima para simular a leitura." : scanHint}
          </p>
        </div>
      </div>
    </div>
  );
}
