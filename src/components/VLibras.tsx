
"use client";

import React from "react";
import Script from "next/script";

type VwDivProps = React.HTMLAttributes<HTMLDivElement> & {
  vw?: string;
  "vw-access-button"?: string;
  "vw-plugin-wrapper"?: string;
};

/**
 * Componente VLibras otimizado para Next.js 15.
 * Utiliza o componente Script do Next para garantir carregamento e inicialização corretos.
 */
export function VLibras() {
  const rootProps: VwDivProps = { vw: "true", className: "enabled" };
  const accessButtonProps: VwDivProps = { "vw-access-button": "true", className: "active" };
  const wrapperProps: VwDivProps = { "vw-plugin-wrapper": "true" };

  return (
    <>
      <div {...rootProps}>
        <div {...accessButtonProps}></div>
        <div {...wrapperProps}>
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
