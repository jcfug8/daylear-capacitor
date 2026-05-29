import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.js";

export const memberTypeEnum = pgEnum("member_type", ["parent", "child"]);
export const joinInitiatedByEnum = pgEnum("join_initiated_by", ["joiner", "parent"]);

export const family = pgTable("family", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const familyMember = pgTable(
  "family_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => family.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    displayName: text("display_name").notNull(),
    memberType: memberTypeEnum("member_type").notNull(),
    points: integer("points").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("family_member_one_family_per_user")
      .on(table.userId)
      .where(sql`${table.userId} is not null`),
  ],
);

export const familyJoinPending = pgTable("family_join_pending", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  adultEmail: text("adult_email").notNull(),
  joinerEmail: text("joiner_email").notNull(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  targetMemberId: uuid("target_member_id").references(() => familyMember.id, {
    onDelete: "cascade",
  }),
  initiatedBy: joinInitiatedByEnum("initiated_by").notNull(),
  invitedMemberType: memberTypeEnum("invited_member_type"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
