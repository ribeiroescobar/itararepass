
"use client";

import React from "react";
import Script from "next/script";

/**
 * Componente VLibras otimizado para Next.js 15.
 * Utiliza o componente Script do Next para garantir carregamento e inicialização corretos.
 */
export function VLibras() {
  return (
    <>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>
      <Script
        id="vlibras-api"
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            // @ts-ignore
            if (window.VLibras) {
              // @ts-ignore
              new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
          } catch (e) {
            console.warn("Erro ao carregar VLibras Widget:", e);
          }
        }}
      />
    </>
  );
}
