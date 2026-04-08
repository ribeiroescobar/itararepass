
"use client";

import React from "react";
import { useItarare } from "@/hooks/use-itarare";

interface ArcProgressProps {
  current: number;
  total: number;
}

export function ArcProgress({ current, total }: ArcProgressProps) {
  const { t, language } = useItarare();
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const radius = 40;
  const circumference = Math.PI * radius; // Meio círculo
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <svg viewBox="0 0 100 55" className="w-full h-auto">
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#arc-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="arc-progress transition-all duration-1000"
        />
        <defs>
          <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-xl font-black text-white leading-none">{current} {t('of')} {total}</span>
        <p className="text-[10px] text-white/60 font-medium">{t('visited_spots')}</p>
      </div>
      
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
          <span className="text-[10px] text-white/80 font-medium">{language === 'pt' ? 'Aventura' : 'Adventure'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-white/80 font-medium">{language === 'pt' ? 'Hospedagem' : 'Lodging'}</span>
        </div>
      </div>
    </div>
  );
}
