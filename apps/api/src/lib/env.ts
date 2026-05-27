import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getCorsOrigins } from "./cors-origins.js";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../..");
config({ path: resolve(rootDir, ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  betterAuthSecret: () => required("BETTER_AUTH_SECRET"),
  betterAuthUrl: () => process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  apiPort: () => Number(process.env.API_PORT ?? 3000),
  corsOrigins: () => getCorsOrigins(),
};
