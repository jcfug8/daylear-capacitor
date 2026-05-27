import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc/init.js";
import * as domain from "./domain.js";

function mapDomainError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (error.message === "USER_NOT_FOUND") {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
  }
  throw error;
}

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await domain.getMe(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),
});
