ALTER TABLE "family_member"
  ADD COLUMN IF NOT EXISTS "avatar_color" text,
  ADD COLUMN IF NOT EXISTS "avatar_icon" text;
