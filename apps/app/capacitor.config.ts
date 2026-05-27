import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.daylear.app",
  appName: "Daylear",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
