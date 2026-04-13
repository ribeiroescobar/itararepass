import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.itarare.pass",
  appName: "Itarare Pass",
  webDir: "out",
  server: {
    url: "https://75.119.133.198.nip.io",
    cleartext: false,
  },
};

export default config;
