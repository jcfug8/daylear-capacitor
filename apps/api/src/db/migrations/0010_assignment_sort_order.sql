ALTER TABLE "list_item_assignees"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;

-- Seed per-assignee order from list layout (list name, item sort_order, item name).
WITH ordered AS (
  SELECT
    lia.list_item_id,
    lia.family_member_id,
    ROW_NUMBER() OVER (
      PARTITION BY lia.family_member_id
      ORDER BY l.name ASC, li.sort_order ASC, li.name ASC
    ) - 1 AS rn
  FROM list_item_assignees lia
  INNER JOIN list_items li ON lia.list_item_id = li.id
  INNER JOIN lists l ON li.list_id = l.id
)
UPDATE list_item_assignees lia
SET sort_order = ordered.rn
FROM ordered
WHERE lia.list_item_id = ordered.list_item_id
  AND lia.family_member_id IS NOT DISTINCT FROM ordered.family_member_id;
