import { cors } from "hono/cors";
import { getCorsOrigins } from "../lib/cors-origins.js";

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowedOrigins = getCorsOrigins();
    if (!origin) {
      return allowedOrigins[0] ?? "http://localhost:5173";
    }
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return null;
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Set-Cookie",
    "X-Requested-With",
    "Better-Auth-CSRF",
  ],
});
