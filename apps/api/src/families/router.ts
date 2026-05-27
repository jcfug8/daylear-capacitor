import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  familyProcedure,
  protectedProcedure,
} from "../trpc/init.js";
import * as domain from "./domain.js";

function mapDomainError(error: unknown): never {
  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHORIZED":
        throw new TRPCError({ code: "UNAUTHORIZED" });
      case "NO_FAMILY":
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No family" });
      case "ALREADY_IN_FAMILY":
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Already in a family",
        });
      case "PARENT_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No parent found with that email",
        });
      case "PARENT_NOT_IN_FAMILY":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No parent in your family with that email",
        });
      case "JOINER_NOT_FOUND":
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account found for that email",
        });
      case "INVALID_OR_EXPIRED_CODE":
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired code",
        });
      case "NOT_PARENT":
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only parent members can do this",
        });
      case "MEMBER_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      case "LAST_PARENT_CANNOT_LEAVE":
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot leave — you are the only parent in this family",
        });
      case "MEMBER_ALREADY_HAS_LOGIN":
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This member already has a login",
        });
      case "MEMBER_LINK_FAILED":
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not link login to this member",
        });
    }
  }
  throw error;
}

export const familiesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(domain.createFamilyInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.createFamily(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  current: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await domain.getCurrent(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  joinStatus: protectedProcedure
    .input(domain.joinStatusInput)
    .query(async ({ ctx, input }) => {
      try {
        return await domain.getJoinStatus(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  requestJoin: protectedProcedure
    .input(domain.adultEmailInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.requestJoin(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  inviteByEmail: familyProcedure
    .input(domain.joinerEmailInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.inviteByEmail(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  requestFamilyInvite: familyProcedure
    .input(domain.requestFamilyInviteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.requestFamilyInvite(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  inviteLoginForMember: familyProcedure
    .input(domain.inviteLoginInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.inviteLoginForMember(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  completeJoin: protectedProcedure
    .input(domain.completeJoinInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.completeJoin(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  confirmJoinByCode: familyProcedure
    .input(domain.confirmJoinByCodeInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.confirmJoinByCode(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  members: createTRPCRouter({
    create: familyProcedure
      .input(domain.createMemberInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.createMemberWithoutLogin(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    remove: familyProcedure
      .input(domain.removeMemberInput)
      .mutation(async ({ ctx, input }) => {
        try {
          await domain.removeMember(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),
  }),
});
