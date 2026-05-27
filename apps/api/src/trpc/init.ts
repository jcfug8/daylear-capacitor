import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const familyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.auth.familyId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "No family",
    });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});
