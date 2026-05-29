import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { family, familyMember } from "./families.js";

export const lists = pgTable("lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listSections = pgTable("list_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listItems = pgTable("list_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  sectionId: uuid("section_id").references(() => listSections.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  completedByMemberId: uuid("completed_by_member_id").references(() => familyMember.id, {
    onDelete: "set null",
  }),
  points: integer("points").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const listItemAssignees = pgTable(
  "list_item_assignees",
  {
    listItemId: uuid("list_item_id")
      .notNull()
      .references(() => listItems.id, { onDelete: "cascade" }),
    familyMemberId: uuid("family_member_id").references(() => familyMember.id, {
      onDelete: "cascade",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    byItem: index("list_item_assignees_list_item_id_idx").on(table.listItemId),
    uniqueMemberAssignment: uniqueIndex("list_item_assignees_item_member_unique")
      .on(table.listItemId, table.familyMemberId)
      .where(sql`${table.familyMemberId} is not null`),
    uniqueAnyoneAssignment: uniqueIndex("list_item_assignees_item_anyone_unique")
      .on(table.listItemId)
      .where(sql`${table.familyMemberId} is null`),
  }),
);

export const listsRelations = relations(lists, ({ many }) => ({
  sections: many(listSections),
  items: many(listItems),
}));

export const listSectionsRelations = relations(listSections, ({ one, many }) => ({
  list: one(lists, {
    fields: [listSections.listId],
    references: [lists.id],
  }),
  items: many(listItems),
}));

export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  list: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
  section: one(listSections, {
    fields: [listItems.sectionId],
    references: [listSections.id],
  }),
  completedByMember: one(familyMember, {
    fields: [listItems.completedByMemberId],
    references: [familyMember.id],
  }),
  assignees: many(listItemAssignees),
}));

export const listItemAssigneesRelations = relations(
  listItemAssignees,
  ({ one }) => ({
    listItem: one(listItems, {
      fields: [listItemAssignees.listItemId],
      references: [listItems.id],
    }),
    familyMember: one(familyMember, {
      fields: [listItemAssignees.familyMemberId],
      references: [familyMember.id],
    }),
  }),
);
