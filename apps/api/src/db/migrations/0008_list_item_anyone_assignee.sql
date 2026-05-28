ALTER TABLE "list_item_assignees"
  DROP CONSTRAINT IF EXISTS "list_item_assignees_pkey";

ALTER TABLE "list_item_assignees"
  ALTER COLUMN "family_member_id" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "list_item_assignees_list_item_id_idx"
  ON "list_item_assignees" ("list_item_id");

CREATE UNIQUE INDEX IF NOT EXISTS "list_item_assignees_item_member_unique"
  ON "list_item_assignees" ("list_item_id", "family_member_id")
  WHERE "family_member_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "list_item_assignees_item_anyone_unique"
  ON "list_item_assignees" ("list_item_id")
  WHERE "family_member_id" IS NULL;
