import { TRPCError } from "@trpc/server";
import { createTRPCRouter, familyProcedure } from "../trpc/init.js";
import * as domain from "./domain.js";

function mapDomainError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (error.message === "NO_FAMILY") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No family" });
    }
  }
  throw error;
}

export const routinesRouter = createTRPCRouter({
  list: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.listRoutines(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  create: familyProcedure
    .input(domain.createRoutineInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.createRoutine(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),
});
