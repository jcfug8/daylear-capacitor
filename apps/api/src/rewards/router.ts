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
    if (error.message === "REWARD_NOT_FOUND") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Reward not found" });
    }
    if (error.message === "MEMBER_NOT_FOUND") {
      throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
    }
    if (error.message === "INSUFFICIENT_POINTS") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Not enough points" });
    }
    if (error.message === "REWARD_NOT_ASSIGNED") {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Reward not available for this person",
      });
    }
  }
  throw error;
}

export const rewardsRouter = createTRPCRouter({
  board: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.getRewardsBoard(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

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

  update: familyProcedure
    .input(domain.updateRewardInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.updateReward(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  delete: familyProcedure
    .input(domain.deleteRewardInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await domain.deleteReward(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  setAssignees: familyProcedure
    .input(domain.setRewardAssigneesInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.setRewardAssignees(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  redeem: familyProcedure
    .input(domain.redeemRewardInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.redeemReward(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),
});
