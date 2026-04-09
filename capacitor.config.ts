import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.itarare.pass",
  appName: "Itarare Pass",
  webDir: "out",
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://SEU_DOMINIO_AQUI",
    cleartext: false,
  },
};

export default config;
