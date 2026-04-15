import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ItarareProvider } from "@/hooks/use-itarare";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { Toaster } from "@/components/ui/toaster";
import { ClientRuntimeBridge } from "@/components/ClientRuntimeBridge";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "Itarare Pass - Explore e Ganhe!",
  description: "App oficial de turismo de Itarare-SP. Faca check-in em pontos turisticos e ganhe cupons.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Itarare Pass",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A4331",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Itarare Pass" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-full bg-[#0d1a14] font-body antialiased">
        <ItarareProvider>
          <ClientRuntimeBridge />
          <ServiceWorkerRegistration />
          <PwaInstallPrompt />
          <AccessibilityMenu />
          <Toaster />
          <div className="relative mx-auto flex min-h-screen w-full flex-col items-center bg-background">
            <div className="flex w-full flex-1 flex-col items-center">
              <div className="w-full max-w-7xl">{children}</div>
            </div>
          </div>
        </ItarareProvider>
      </body>
    </html>
  );
}
