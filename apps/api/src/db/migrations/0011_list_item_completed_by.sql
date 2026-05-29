ALTER TABLE "list_items"
  ADD COLUMN IF NOT EXISTS "completed_by_member_id" uuid
  REFERENCES "family_member"("id") ON DELETE SET NULL;

-- Best-effort backfill: attribute prior completions to the first named assignee.
UPDATE "list_items" li
SET "completed_by_member_id" = (
  SELECT lia."family_member_id"
  FROM "list_item_assignees" lia
  WHERE lia."list_item_id" = li."id"
    AND lia."family_member_id" IS NOT NULL
  ORDER BY lia."sort_order", lia."family_member_id"
  LIMIT 1
)
WHERE li."completed" = true;

ALTER TABLE "list_items" DROP COLUMN IF EXISTS "completed";
