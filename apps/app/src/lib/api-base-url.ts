import { Capacitor } from "@capacitor/core";

/**
 * Android emulator: "localhost" is the emulator itself. Use the host loopback alias.
 * @see https://developer.android.com/studio/run/emulator-networking
 */
function mapLocalhostForAndroidEmulator(url: string): string {
  if (Capacitor.getPlatform() !== "android") return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.hostname = "10.0.2.2";
      return parsed.origin;
    }
  } catch {
    // keep original if not a valid URL
  }
  return url;
}

/**
 * In dev, Vite proxies /api and /trpc to the API server so the browser uses the same
 * origin (localhost or LAN IP) and cookies/CORS work on any interface.
 *
 * On native (Capacitor), use VITE_API_URL. For local http:// APIs, run cap sync with
 * androidScheme/http hostname aligned to the API host (see capacitor.config.ts).
 * Android emulator: use `pnpm cap:android` so the WebView is http://10.0.2.2 and
 * matches http://10.0.2.2:3000 (SameSite=Lax cookies). iOS Simulator can use localhost.
 */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL;

  if (Capacitor.isNativePlatform()) {
    const base = configured ?? "http://localhost:3000";
    return mapLocalhostForAndroidEmulator(base);
  }

  if (import.meta.env.DEV) {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return import.meta.env.VITE_API_URL ?? "http://localhost:5173";
  }
  return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
}
