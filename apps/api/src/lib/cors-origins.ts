import { getLanAddresses } from "./network-addresses.js";

const APP_PORT = () => Number(process.env.APP_PORT ?? 5173);
const MARKETING_PORT = () => Number(process.env.MARKETING_PORT ?? 5174);
const API_PORT = () => Number(process.env.API_PORT ?? 3000);

function originsFromEnv(): string[] {
  return (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Allowed browser origins for CORS and Better Auth trustedOrigins. */
export function getCorsOrigins(): string[] {
  const origins = new Set(originsFromEnv());

  origins.add(`http://localhost:${APP_PORT()}`);
  origins.add(`http://127.0.0.1:${APP_PORT()}`);
  origins.add(`http://localhost:${MARKETING_PORT()}`);
  origins.add(`http://127.0.0.1:${MARKETING_PORT()}`);

  if (process.env.DEV_NETWORK === "1") {
    for (const ip of getLanAddresses()) {
      origins.add(`http://${ip}:${APP_PORT()}`);
      origins.add(`http://${ip}:${MARKETING_PORT()}`);
      origins.add(`http://${ip}:${API_PORT()}`);
    }
  }

  return [...origins];
}
