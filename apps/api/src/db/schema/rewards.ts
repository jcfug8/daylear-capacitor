import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { family, familyMember } from "./families.js";

export const rewards = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rewardAssignees = pgTable(
  "reward_assignees",
  {
    rewardId: uuid("reward_id")
      .notNull()
      .references(() => rewards.id, { onDelete: "cascade" }),
    familyMemberId: uuid("family_member_id")
      .notNull()
      .references(() => familyMember.id, { onDelete: "cascade" }),
  },
  (table) => ({
    byReward: index("reward_assignees_reward_id_idx").on(table.rewardId),
  }),
);

export const rewardsRelations = relations(rewards, ({ many }) => ({
  assignees: many(rewardAssignees),
}));

export const rewardAssigneesRelations = relations(rewardAssignees, ({ one }) => ({
  reward: one(rewards, {
    fields: [rewardAssignees.rewardId],
    references: [rewards.id],
  }),
  familyMember: one(familyMember, {
    fields: [rewardAssignees.familyMemberId],
    references: [familyMember.id],
  }),
}));
