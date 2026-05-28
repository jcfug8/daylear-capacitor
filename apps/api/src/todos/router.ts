import { TRPCError } from "@trpc/server";
import { createTRPCRouter, familyProcedure } from "../trpc/init.js";
import * as domain from "./domain.js";

function mapDomainError(error: unknown): never {
  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHORIZED":
        throw new TRPCError({ code: "UNAUTHORIZED" });
      case "NO_FAMILY":
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No family" });
      case "MEMBER_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      case "INVALID_TODO_ORDER":
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid todo order" });
    }
  }
  throw error;
}

export const todosRouter = createTRPCRouter({
  list: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.listAssignedTodos(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  applyAssigneeOrder: familyProcedure
    .input(domain.applyAssigneeTodoOrderInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await domain.applyAssigneeTodoOrder(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),
});
