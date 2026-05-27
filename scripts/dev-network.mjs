#!/usr/bin/env node
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { getLanAddresses, getPrimaryLanAddress } from "./network-addresses.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiPort = process.env.API_PORT ?? "3000";
const appPort = process.env.APP_PORT ?? "5173";
const marketingPort = process.env.MARKETING_PORT ?? "5174";

const lanAddresses = getLanAddresses();
const primary = getPrimaryLanAddress();

if (!primary) {
  console.warn(
    "Warning: no LAN IPv4 address found. Services will still bind to 0.0.0.0; use localhost on this machine.\n",
  );
}

const corsOrigins = new Set([
  `http://localhost:${appPort}`,
  `http://127.0.0.1:${appPort}`,
  `http://localhost:${marketingPort}`,
  `http://127.0.0.1:${marketingPort}`,
  `http://localhost:${apiPort}`,
  `http://127.0.0.1:${apiPort}`,
]);
for (const ip of lanAddresses) {
  corsOrigins.add(`http://${ip}:${appPort}`);
  corsOrigins.add(`http://${ip}:${marketingPort}`);
  corsOrigins.add(`http://${ip}:${apiPort}`);
}

console.log("\n Daylear — network dev mode (reachable on your LAN)\n");
if (lanAddresses.length === 0) {
  console.log("  No LAN addresses detected.\n");
} else {
  for (const ip of lanAddresses) {
    console.log(`  ${ip}`);
    console.log(`    App:       http://${ip}:${appPort}`);
    console.log(`    Marketing: http://${ip}:${marketingPort}`);
    console.log(`    API:       http://${ip}:${apiPort} (proxied via app in dev)`);
    console.log("");
  }
}
console.log("  Open the app using one of the URLs above (not :3000 directly).");
console.log("  Auth and tRPC are proxied through Vite — same origin, no CORS.\n");

const childEnv = {
  ...process.env,
  HOST: "0.0.0.0",
  DEV_NETWORK: "1",
  LAN_IP: primary ?? "",
  // API base URL for Better Auth server config (direct API port)
  BETTER_AUTH_URL: `http://127.0.0.1:${apiPort}`,
  CORS_ORIGIN: [...corsOrigins].join(","),
  API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
};

const child = spawn(
  "pnpm",
  [
    "exec",
    "turbo",
    "dev:network",
    "--filter=@daylear/api",
    "--filter=@daylear/app",
    "--filter=@daylear/marketing",
  ],
  {
    cwd: rootDir,
    env: childEnv,
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
