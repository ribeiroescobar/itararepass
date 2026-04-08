
"use client";

import React, { useState, useEffect } from "react";
import { 
  Accessibility, 
  Type, 
  Contrast, 
  Languages, 
  Volume2, 
  Eye, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useItarare } from "@/hooks/use-itarare";

export function AccessibilityMenu() {
  const itarare = useItarare();
  
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [open, setOpen] = useState(false);

  if (!itarare) return null;

  const { t } = itarare;

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const html = document.documentElement;
    
    if (highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    if (dyslexicFont) {
      html.classList.add("font-dyslexic");
    } else {
      html.classList.remove("font-dyslexic");
    }

    // Define a variável CSS que escala o rem no globals.css
    html.style.setProperty("--font-scale", fontScale.toString());
  }, [highContrast, fontScale, dyslexicFont]);

  const handleReset = () => {
    setHighContrast(false);
    setFontScale(1);
    setDyslexicFont(false);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xl border-2 border-white/20 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 group"
            title={t('accessibility')}
          >
            <Accessibility className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black uppercase leading-none">{t('accessibility').substring(0, 5)}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-[#0d1a14] border-l border-white/10 w-full sm:max-w-md p-0 overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full">
          {/* Cabeçalho Fixo */}
          <SheetHeader className="p-6 border-b border-white/5 bg-black/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Accessibility className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-white font-black uppercase tracking-tighter italic text-lg leading-none">
                  {t('accessibility')}
                </SheetTitle>
                <SheetDescription className="text-white/40 text-[8px] font-bold uppercase tracking-widest mt-1">
                  {t('accessibility_subtitle')}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Área de Conteúdo Rolável */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            
            {/* Escala de Texto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <Type className="w-3 h-3" /> {t('interface_size')}
                </h4>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black italic border border-primary/20">
                  {fontScale.toFixed(1)}x
                </span>
              </div>
              
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 space-y-5">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                   <p className="text-[8px] text-white/40 uppercase mb-2 font-black">{t('real_time_preview')}</p>
                   <p className="font-bold text-white leading-tight">{t('example_text')}</p>
                </div>

                <Slider 
                  value={[fontScale]} 
                  min={1.0} 
                  max={3.0} 
                  step={0.1} 
                  onValueChange={([val]) => setFontScale(val)}
                  className="py-4"
                />
                
                <div className="flex justify-between">
                  <span className="text-[9px] font-black text-white/20 uppercase">{t('normal')}</span>
                  <span className="text-[9px] font-black text-primary uppercase font-bold">{t('maximum')} (3.0x)</span>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> {t('visual_prefs')}
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Contrast className="w-4 h-4 text-blue-500" />
                    <div>
                      <Label htmlFor="contrast" className="text-sm font-black text-white uppercase tracking-tight leading-none">{t('high_contrast')}</Label>
                      <p className="text-[9px] text-white/30 uppercase mt-1">{t('sun_glare_desc')}</p>
                    </div>
                  </div>
                  <Switch 
                    id="contrast" 
                    checked={highContrast} 
                    onCheckedChange={setHighContrast} 
                    className="data-[state=checked]:bg-blue-600 scale-90"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <Label htmlFor="dyslexic" className="text-sm font-black text-white uppercase tracking-tight leading-none">{t('dyslexic_font')}</Label>
                      <p className="text-[9px] text-white/30 uppercase mt-1">{t('adapted_typography')}</p>
                    </div>
                  </div>
                  <Switch 
                    id="dyslexic" 
                    checked={dyslexicFont} 
                    onCheckedChange={setDyslexicFont} 
                    className="data-[state=checked]:bg-blue-600 scale-90"
                  />
                </div>
              </div>
            </div>

            {/* Áudio Descrição */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Volume2 className="w-3 h-3" /> {t('audio_assistance')}
              </h4>
              <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/80 font-black uppercase leading-tight italic">{t('voice_guide_active')}</p>
                  <p className="text-[9px] text-white/40 uppercase mt-1 leading-relaxed">{t('voice_guide_desc')}</p>
                </div>
              </div>
            </div>

            {/* Comunidade Surda */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Languages className="w-3 h-3" /> {t('libras_project')}
              </h4>
              <div className="p-5 bg-blue-900/10 border border-blue-500/20 rounded-[2rem] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Languages className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase italic">{t('inclusion_itarare')}</h4>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed font-medium uppercase tracking-tight">
                  {t('libras_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Rodapé Fixo */}
          <div className="p-6 bg-black/60 border-t border-white/10 flex flex-col gap-3 shrink-0">
            <Button 
              onClick={() => setOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest h-12 rounded-2xl shadow-xl shadow-blue-600/20 text-[11px]"
            >
              {t('apply_adjustments')}
            </Button>
            <Button 
              variant="ghost"
              onClick={handleReset}
              className="w-full text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3 h-3" /> {t('reset_defaults')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
