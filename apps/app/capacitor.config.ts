import type { CapacitorConfig } from "@capacitor/cli";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Minimal .env reader (Capacitor loads this file as CJS; do not import Vite here). */
function readEnvValue(key: string, dir: string): string | undefined {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(dir, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      if (trimmed.slice(0, eq).trim() !== key) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return undefined;
}

const repoRoot = resolve(__dirname, "../..");
const apiUrl =
  process.env.VITE_API_URL ?? readEnvValue("VITE_API_URL", repoRoot);

function isHttpApiUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Capacitor serves the bundled app from `https://localhost` by default. Auth cookies
 * use SameSite=Lax, so the API must be same-site (same scheme + host; port can differ).
 * Android emulator: map localhost API → hostname 10.0.2.2 (see cap:android script).
 * Physical device + LAN API: set hostname to the API host from VITE_API_URL.
 */
function serverHostname(): string | undefined {
  if (process.env.CAPACITOR_SERVER_HOSTNAME) {
    return process.env.CAPACITOR_SERVER_HOSTNAME;
  }
  if (!apiUrl || !isHttpApiUrl(apiUrl)) return undefined;
  try {
    const { hostname } = new URL(apiUrl);
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return hostname;
    }
  } catch {
    // ignore
  }
  return undefined;
}

const httpApi = isHttpApiUrl(apiUrl);
const hostname = serverHostname();

const config: CapacitorConfig = {
  appId: "com.daylear.app",
  appName: "Daylear",
  webDir: "dist",
  server: {
    androidScheme: httpApi ? "http" : "https",
    iosScheme: httpApi ? "http" : "https",
    /** Required for http:// API calls from the WebView on Android 9+ (dev only). */
    ...(httpApi ? { cleartext: true } : {}),
    ...(hostname ? { hostname } : {}),
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
