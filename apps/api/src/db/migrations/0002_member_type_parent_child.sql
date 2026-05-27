-- Rename member_type and join_initiated_by enum values (adult/kid -> parent/child)

ALTER TYPE "member_type" RENAME VALUE 'adult' TO 'parent';
ALTER TYPE "member_type" RENAME VALUE 'kid' TO 'child';

ALTER TYPE "join_initiated_by" RENAME VALUE 'adult' TO 'parent';
