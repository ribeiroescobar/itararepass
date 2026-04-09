
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CheckCircle, Info, Navigation, User, Store, Shield } from "lucide-react";
import { useItarare } from "@/hooks/use-itarare";

export function BottomNav() {
  const pathname = usePathname();
  const { t, isAuthorized } = useItarare();
  const isAdmin = isAuthorized("admin");
  const isMerchant = isAuthorized("merchant");

  const touristItems = [
    { label: t('explore'), icon: LayoutGrid, path: "/explore" },
    { label: t('map'), icon: Navigation, path: "/map" },
    { label: t('coupons'), icon: CheckCircle, path: "/coupons" },
    { label: t('profile'), icon: User, path: "/profile" },
    { label: t('about'), icon: Info, path: "/about" },
  ];

  const merchantItems = [
    { label: "Gestão", icon: Store, path: "/merchant/dashboard" },
    { label: t('map'), icon: Navigation, path: "/map" },
    { label: t('profile'), icon: User, path: "/profile" },
    { label: t('about'), icon: Info, path: "/about" },
  ];

  const adminItems = [
    { label: "Gestão", icon: Shield, path: "/admin/dashboard" },
    { label: t('map'), icon: Navigation, path: "/map" },
    { label: t('profile'), icon: User, path: "/profile" },
    { label: t('about'), icon: Info, path: "/about" },
  ];

  const navItems = isAdmin ? adminItems : isMerchant ? merchantItems : touristItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[100] pwa-safe-area pointer-events-none">
      <nav className="w-full max-w-4xl bg-[#0d1a14]/95 backdrop-blur-xl border-t border-white/5 px-2 py-4 flex justify-around items-center pointer-events-auto shadow-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-2 active:scale-95 ${isActive ? 'text-primary' : 'text-white/40'}`}
              prefetch={true}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 text-primary' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
