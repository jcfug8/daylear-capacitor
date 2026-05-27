-- Drop family_role; add target_member_id for linking login to existing members

ALTER TABLE "family_join_pending"
  ADD COLUMN IF NOT EXISTS "target_member_id" uuid REFERENCES "family_member"("id") ON DELETE CASCADE;

ALTER TABLE "family_member" DROP COLUMN IF EXISTS "role";

DROP TYPE IF EXISTS "family_role";
