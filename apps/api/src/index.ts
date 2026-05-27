import "./lib/env.js";
import { serve } from "@hono/node-server";
import { getLanAddresses } from "./lib/network-addresses.js";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { auth } from "./lib/auth.js";
import { env } from "./lib/env.js";
import { corsMiddleware } from "./middleware/cors.js";
import { registerHealthRoutes } from "./routes/health.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/root.js";

export type { AppRouter } from "./trpc/root.js";

const app = new Hono();

app.use("*", corsMiddleware);

registerHealthRoutes(app);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

const port = env.apiPort();
const hostname = process.env.HOST ?? "127.0.0.1";

serve({ fetch: app.fetch, port, hostname }, () => {
  const base = (host: string) => `http://${host}:${port}`;
  console.log(`Daylear API listening on ${base("localhost")}`);
  console.log(`  tRPC:   ${base("localhost")}/trpc`);
  console.log(`  Auth:   ${base("localhost")}/api/auth`);
  console.log(`  Health: ${base("localhost")}/health`);

  if (hostname === "0.0.0.0") {
    const lan = getLanAddresses();
    if (lan.length > 0) {
      console.log("\n  LAN addresses:");
      for (const ip of lan) {
        console.log(`    ${base(ip)}/trpc`);
      }
    }
  }
});
