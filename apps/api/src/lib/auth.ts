import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import * as schema from "../db/schema/index.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  appName: "Daylear",
  emailAndPassword: {
    enabled: true,
  },
  secret: env.betterAuthSecret(),
  baseURL: env.betterAuthUrl(),
  trustedOrigins: env.corsOrigins(),
  trustedProxyHeaders: process.env.DEV_NETWORK === "1",
});

export type Session = typeof auth.$Infer.Session;
