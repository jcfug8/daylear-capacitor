/**
 * In dev, Vite proxies /api and /trpc to the API server so the browser uses the same
 * origin (localhost or LAN IP) and cookies/CORS work on any interface.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return import.meta.env.VITE_API_URL ?? "http://localhost:5173";
  }
  return import.meta.env.VITE_API_URL ?? "http://localhost:3000";
}
