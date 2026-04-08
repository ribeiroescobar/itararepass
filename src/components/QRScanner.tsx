
"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Camera, Loader2, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  targetName: string;
  demoMode: boolean;
  targetId: string;
  themeColor?: string;
}

export function QRScanner({ onScan, onClose, targetName, targetId, demoMode, themeColor = "#f97316" }: QRScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const SCAN_REGION_ID = "qr-reader-region";

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (isMounted && cameras && cameras.length > 0) {
          setHasCameraPermission(true);
          const html5QrCode = new Html5Qrcode(SCAN_REGION_ID);
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 20, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (isMounted && !scanning) {
                handleScanSuccess(decodedText.trim());
              }
            },
            () => {}
          );
          if (isMounted) setIsInitializing(false);
        } else if (isMounted) {
          setHasCameraPermission(false);
          setIsInitializing(false);
        }
      } catch (err) {
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
    setScanning(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }
    onScan(decodedText);
    setTimeout(() => { if (isInitializing === false) setScanning(false); }, 2000);
  };

  const handleDemoBypass = () => {
    handleScanSuccess(targetId === 'any' ? 'demo_success' : targetId);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col">
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Camera className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter italic leading-none">Validação de Local</h2>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">Escaneando: {targetName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white rounded-2xl">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-[320px] aspect-square relative rounded-[3rem] overflow-hidden border-2 border-white/10 bg-black shadow-2xl">
          <div id={SCAN_REGION_ID} className="w-full h-full" />
          
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[200px] h-[200px] border-2 border-primary/40 rounded-3xl animate-pulse" />
          </div>

          {(scanning || isInitializing) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-[9px] font-black text-white uppercase tracking-widest mt-4">Iniciando Lente...</p>
            </div>
          )}
        </div>

        <div className="mt-10 w-full max-w-sm flex flex-col items-center gap-6">
          {hasCameraPermission === false && !demoMode && (
            <Alert variant="destructive" className="bg-red-950/20 border-red-500/20 rounded-3xl">
              <ShieldAlert className="w-5 h-5 mb-2" />
              <AlertTitle className="text-white font-black uppercase text-xs">Câmera Não Detectada</AlertTitle>
              <AlertDescription className="text-[10px] text-white/50">Por favor, permita o acesso à câmera nas configurações do seu navegador.</AlertDescription>
            </Alert>
          )}

          {demoMode && (
            <Button 
              onClick={handleDemoBypass}
              className="bg-red-600 hover:bg-red-700 text-white font-black h-16 rounded-[2rem] px-8 uppercase text-xs tracking-widest shadow-2xl shadow-red-600/20 border-2 border-white/10 flex items-center gap-3 animate-bounce"
            >
              <Zap className="w-4 h-4 fill-white" />
              Pular Scan (Usar no Pitch)
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          
          <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
            {demoMode ? "Modo Demo Ativo: Use o botão acima para simular a presença." : "Aponte para o QR Code oficial localizado no atrativo turístico."}
          </p>
        </div>
      </div>
    </div>
  );
}
