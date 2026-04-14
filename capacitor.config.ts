import type { CapacitorConfig } from "@capacitor/cli";

const remoteApiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://75.119.133.198.nip.io";
const useRemoteServer = process.env.CAP_REMOTE_SERVER === "1";

const config: CapacitorConfig = {
  appId: "br.itarare.pass",
  appName: "Itarare Pass",
  webDir: useRemoteServer ? "android-shell" : "out",
  ...(useRemoteServer
    ? {
        server: {
          url: remoteApiBase,
          cleartext: false,
        },
      }
    : {}),
};

export default config;
