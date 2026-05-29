ALTER TABLE "family_member"
  ADD COLUMN IF NOT EXISTS "points" integer NOT NULL DEFAULT 0;

ALTER TABLE "rewards"
  ADD COLUMN IF NOT EXISTS "points" integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "reward_assignees" (
  "reward_id" uuid NOT NULL REFERENCES "rewards"("id") ON DELETE CASCADE,
  "family_member_id" uuid NOT NULL REFERENCES "family_member"("id") ON DELETE CASCADE,
  PRIMARY KEY ("reward_id", "family_member_id")
);

CREATE INDEX IF NOT EXISTS "reward_assignees_reward_id_idx"
  ON "reward_assignees" ("reward_id");

-- Sync member balances from completed list items.
UPDATE "family_member" fm
SET "points" = COALESCE(
  (
    SELECT SUM(li."points")
    FROM "list_items" li
    WHERE li."completed_by_member_id" = fm."id"
  ),
  0
);
