ALTER TABLE "list_items" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY list_id, section_id
      ORDER BY created_at ASC
    ) - 1 AS rn
  FROM list_items
)
UPDATE list_items AS li
SET sort_order = ranked.rn
FROM ranked
WHERE li.id = ranked.id;
