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

export const mealsRouter = createTRPCRouter({
  list: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.listMeals(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  create: familyProcedure
    .input(domain.createMealInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.createMeal(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),
});
