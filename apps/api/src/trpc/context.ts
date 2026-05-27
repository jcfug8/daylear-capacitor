import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "../lib/auth.js";
import { authFromSession } from "../shared/auth-context.js";

export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  return {
    auth: await authFromSession(session),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
