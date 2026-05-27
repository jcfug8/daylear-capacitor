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
      case "LIST_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
      case "SECTION_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "Section not found" });
      case "ITEM_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      case "MEMBER_NOT_FOUND":
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      case "INVALID_LAYOUT":
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid layout" });
    }
  }
  throw error;
}

export const listsRouter = createTRPCRouter({
  list: familyProcedure.query(async ({ ctx }) => {
    try {
      return await domain.listLists(ctx.auth);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  get: familyProcedure.input(domain.getListInput).query(async ({ ctx, input }) => {
    try {
      return await domain.getList(ctx.auth, input);
    } catch (e) {
      mapDomainError(e);
    }
  }),

  create: familyProcedure
    .input(domain.createListInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.createList(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  update: familyProcedure
    .input(domain.updateListInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.updateList(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  delete: familyProcedure
    .input(domain.deleteListInput)
    .mutation(async ({ ctx, input }) => {
      try {
        await domain.deleteList(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  applyLayout: familyProcedure
    .input(domain.applyListLayoutInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await domain.applyListLayout(ctx.auth, input);
      } catch (e) {
        mapDomainError(e);
      }
    }),

  sections: createTRPCRouter({
    create: familyProcedure
      .input(domain.createListSectionInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.createListSection(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    update: familyProcedure
      .input(domain.updateListSectionInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.updateListSection(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    delete: familyProcedure
      .input(domain.deleteListSectionInput)
      .mutation(async ({ ctx, input }) => {
        try {
          await domain.deleteListSection(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),
  }),

  items: createTRPCRouter({
    create: familyProcedure
      .input(domain.createListItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.createListItem(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    update: familyProcedure
      .input(domain.updateListItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.updateListItem(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    delete: familyProcedure
      .input(domain.deleteListItemInput)
      .mutation(async ({ ctx, input }) => {
        try {
          await domain.deleteListItem(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),

    setAssignees: familyProcedure
      .input(domain.setListItemAssigneesInput)
      .mutation(async ({ ctx, input }) => {
        try {
          return await domain.setListItemAssignees(ctx.auth, input);
        } catch (e) {
          mapDomainError(e);
        }
      }),
  }),
});
