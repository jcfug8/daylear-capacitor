-- Families, memberships, join codes; retarget resources to family_id (no backward compat)

DO $$ BEGIN
  CREATE TYPE "member_type" AS ENUM ('parent', 'child');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "family_role" AS ENUM ('owner', 'admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "join_initiated_by" AS ENUM ('joiner', 'parent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "family" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "family_member" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "display_name" text NOT NULL,
  "member_type" "member_type" NOT NULL,
  "role" "family_role" NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "family_member_one_family_per_user"
  ON "family_member" ("user_id")
  WHERE "user_id" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "family_join_pending" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "adult_email" text NOT NULL,
  "joiner_email" text NOT NULL,
  "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE,
  "initiated_by" "join_initiated_by" NOT NULL,
  "expires_at" timestamp NOT NULL,
  "used_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Retarget resource tables: drop user-scoped data, replace user_id with family_id
TRUNCATE TABLE "lists", "meals", "routines", "rewards";

ALTER TABLE "lists" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "lists" ADD COLUMN IF NOT EXISTS "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE;

ALTER TABLE "meals" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "meals" ADD COLUMN IF NOT EXISTS "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE;

ALTER TABLE "routines" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "routines" ADD COLUMN IF NOT EXISTS "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE;

ALTER TABLE "rewards" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "rewards" ADD COLUMN IF NOT EXISTS "family_id" uuid NOT NULL REFERENCES "family"("id") ON DELETE CASCADE;
