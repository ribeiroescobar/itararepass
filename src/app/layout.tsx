
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { ItarareProvider } from '@/hooks/use-itarare';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Itararé Pass - Explore e Ganhe!',
  description: 'App oficial de turismo de Itararé-SP. Faça check-in em pontos turísticos e ganhe cupons.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Itararé Pass',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1A4331',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased bg-[#0d1a14] min-h-full">
        <ItarareProvider>
          <AccessibilityMenu />
          <Toaster />
          <div className="w-full min-h-screen relative bg-background mx-auto flex flex-col items-center">
            <div className="w-full flex-1 flex flex-col items-center">
              <div className="w-full max-w-7xl">
                {children}
              </div>
            </div>
          </div>
        </ItarareProvider>
      </body>
    </html>
  );
}
