
"use client";

import React from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Logo() {
  const logoData = PlaceHolderImages.find(img => img.id === "logo-startup");
  
  return (
    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 mb-4 select-none">
      <div className="relative w-48 h-32 sm:w-64 sm:h-44 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
        <Image 
          src="/logo.jpeg"
          alt="Itararé Pass Logo"
          fill
          priority
          className="object-contain rounded-[2rem]"
          data-ai-hint="itarare pass logo"
        />
      </div>
    </div>
  );
}
