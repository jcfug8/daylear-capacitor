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

export const rewardsRouter = createTRPCRouter({
  list: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.listRewards(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  create: familyProcedure
    .input(domain.createRewardInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.createReward(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),
});
