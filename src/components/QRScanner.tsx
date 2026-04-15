"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Loader2, ShieldAlert, X, Zap } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (code: string) => void | Promise<void>;
  onClose: () => void;
  targetName: string;
  demoMode: boolean;
  targetId: string;
  themeColor?: string;
  title?: string;
  scanHint?: string;
}

type ScannerMode = "native" | "fallback" | null;

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);
  const fallbackRegionId = useId().replace(/:/g, "");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeLoopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const stopNativeStream = () => {
      if (nativeLoopRef.current) {
        clearTimeout(nativeLoopRef.current);
        nativeLoopRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const stopFallbackScanner = async () => {
      if (!scannerRef.current) return;
      const scanner = scannerRef.current;
      if (scanner.isScanning) {
        await scanner.stop().catch(() => {});
      }
      try {
        scanner.clear();
      } catch {}
      scannerRef.current = null;
    };

    const handleNativeDetection = async (detector: any) => {
      if (!isMounted || !videoRef.current || isHandlingScanRef.current) return;

      try {
        if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes?.find((code: any) => typeof code?.rawValue === "string")?.rawValue;
          if (rawValue) {
            await handleScanSuccess(rawValue.trim());
            return;
          }
        }
      } catch {}

      nativeLoopRef.current = setTimeout(() => {
        void handleNativeDetection(detector);
      }, 220);
    };

    const startFallbackScanner = async () => {
      try {
        setScannerMode("fallback");
        const cameras = await Html5Qrcode.getCameras();
        if (!isMounted || !cameras?.length) {
          throw new Error("Nenhuma camera disponivel neste dispositivo.");
        }

        const scanner = new Html5Qrcode(fallbackRegionId);
        scannerRef.current = scanner;
        const preferredCamera =
          cameras.find((camera) => /back|rear|traseira|environment/i.test(camera.label)) ?? cameras[0];

        await scanner.start(
          preferredCamera.id,
          {
            fps: 12,
            aspectRatio: 1,
            qrbox: { width: 240, height: 240 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          } as any,
          (decodedText) => {
            if (isMounted && !isHandlingScanRef.current) {
              void handleScanSuccess(decodedText.trim());
            }
          },
          () => {}
        );

        if (isMounted) {
          setHasCameraPermission(true);
          setCameraError(null);
          setIsInitializing(false);
        }
      } catch {
        if (isMounted) {
          setHasCameraPermission(false);
          setCameraError("Nao foi possivel iniciar a camera. Tente usar o codigo manual.");
          setIsInitializing(false);
        }
      }
    };

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setHasCameraPermission(true);
        setCameraError(null);
        streamRef.current = stream;

        const BarcodeDetectorCtor = (globalThis as any).BarcodeDetector;
        if (BarcodeDetectorCtor && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
          setScannerMode("native");
          setIsInitializing(false);
          void handleNativeDetection(detector);
          return;
        }

        stopNativeStream();
        await startFallbackScanner();
      } catch (err: any) {
        const message =
          err?.name === "NotAllowedError"
            ? "Permissao da camera negada. Libere o acesso nas configuracoes do app."
            : err?.name === "NotFoundError"
              ? "Nenhuma camera foi encontrada neste dispositivo."
              : "Nao foi possivel iniciar a camera. Tente usar o codigo manual.";
        if (isMounted) {
          setHasCameraPermission(false);
          setCameraError(message);
          setIsInitializing(false);
        }
      }
    };

    void startScanner();

    return () => {
      isMounted = false;
      stopNativeStream();
      void stopFallbackScanner();
    };
  }, [fallbackRegionId]);

  const handleScanSuccess = async (decodedText: string) => {
    if (!decodedText) return;
    isHandlingScanRef.current = true;
    setScanning(true);
    setIsInitializing(false);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }

    try {
      await onScan(decodedText);
    } finally {
      setTimeout(() => {
        isHandlingScanRef.current = false;
        setScanning(false);
      }, 900);
    }
  };

  const handleDemoBypass = () => {
    void handleScanSuccess(targetId === "any" ? "demo_success" : targetId);
  };

  const handleNativeCapture = () => {
    fileInputRef.current?.click();
  };

  const handleCapturedFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    event.target.value = "";

    if (!imageFile || isHandlingScanRef.current) return;

    isHandlingScanRef.current = true;
    setScanning(true);
    setIsInitializing(false);
    setCameraError(null);

    try {
      const fileScanner = new Html5Qrcode(fallbackRegionId);
      const decodedText = await fileScanner.scanFile(imageFile, false);
      fileScanner.clear();
      await handleScanSuccess(decodedText.trim());
    } catch {
      setCameraError("Nao foi possivel ler o QR pela foto. Tente aproximar mais o codigo ou usar o codigo manual.");
    } finally {
      setTimeout(() => {
        isHandlingScanRef.current = false;
        setScanning(false);
      }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/98 backdrop-blur-2xl">
      <div className="sticky top-0 z-20 border-b border-white/5 bg-black/70 p-4 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Camera className="h-5 w-5 text-white/60" />
            </div>
            <div className="min-w-0">
              <h2 className="leading-none text-lg font-black uppercase tracking-tighter text-white italic sm:text-xl">{title}</h2>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/40">Escaneando: {targetName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hidden items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white/40 transition-colors hover:text-white sm:inline-flex"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-5xl flex-col items-center justify-center p-6 sm:p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapturedFile}
          className="hidden"
        />

        <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-[2.5rem] border-2 border-white/10 bg-black shadow-2xl sm:rounded-[3rem]">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`absolute inset-0 h-full w-full object-cover ${scannerMode === "native" ? "opacity-100" : "opacity-0"}`}
          />
          <div id={fallbackRegionId} className={`h-full w-full ${scannerMode === "fallback" ? "opacity-100" : "opacity-0"}`} />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[200px] w-[200px] animate-pulse rounded-3xl border-2 border-primary/40" style={{ borderColor: `${themeColor}66` }} />
          </div>

          {(scanning || isInitializing) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-white">
                {scanning ? "Validando cupom..." : "Iniciando lente..."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-6 pb-10">
          {(hasCameraPermission === false || cameraError) && !demoMode && (
            <Alert variant="destructive" className="rounded-3xl border-red-500/20 bg-red-950/20">
              <ShieldAlert className="mb-2 h-5 w-5" />
              <AlertTitle className="text-xs font-black uppercase text-white">Falha ao abrir camera</AlertTitle>
              <AlertDescription className="text-[10px] text-white/50">
                {cameraError || "Permita o acesso a camera nas configuracoes do seu navegador ou dispositivo."}
              </AlertDescription>
            </Alert>
          )}

          {!demoMode && (
            <Button
              onClick={handleNativeCapture}
              variant="outline"
              className="flex h-14 w-full items-center gap-3 rounded-[1.5rem] border-white/10 bg-white/5 px-6 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10"
            >
              <Camera className="h-4 w-4" />
              Abrir camera do aparelho
            </Button>
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
            {demoMode ? "Modo demo ativo: use o botao acima para simular a leitura." : "Se a lente ao vivo falhar no APK, use a camera do aparelho ou o codigo manual."}
          </p>
        </div>
      </div>
    </div>
  );
}
