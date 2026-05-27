CREATE TABLE IF NOT EXISTS "list_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "list_id" uuid NOT NULL REFERENCES "lists"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "list_item_assignees" (
  "list_item_id" uuid NOT NULL REFERENCES "list_items"("id") ON DELETE CASCADE,
  "family_member_id" uuid NOT NULL REFERENCES "family_member"("id") ON DELETE CASCADE,
  PRIMARY KEY ("list_item_id", "family_member_id")
);
