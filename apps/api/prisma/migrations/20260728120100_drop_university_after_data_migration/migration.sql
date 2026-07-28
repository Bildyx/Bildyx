-- Hand-written, phase 2 of 2 of the University -> Organization merge.
--
-- DO NOT apply this migration until:
--   1. 20260728120000_add_academic_fields_and_new_profile_tables has been
--      applied, AND
--   2. prisma/migrate-universities-to-organizations.ts has been run
--      successfully against the target database (copies every University
--      row into Organization with subtype=UNIVERSITY, and repoints every
--      user_educations.organization_id accordingly).
--
-- Applying this before that script has run permanently drops the
-- universities table and university_id column, taking any not-yet-migrated
-- data with it.

-- DropForeignKey
ALTER TABLE "user_educations" DROP CONSTRAINT IF EXISTS "user_educations_university_id_fkey";
ALTER TABLE "universities" DROP CONSTRAINT IF EXISTS "universities_city_id_fkey";
ALTER TABLE "universities" DROP CONSTRAINT IF EXISTS "universities_country_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "user_educations_university_id_idx";

-- AlterTable
ALTER TABLE "user_educations" DROP COLUMN "university_id";
ALTER TABLE "organizations" DROP COLUMN "graduates";

-- DropTable
DROP TABLE "universities";

-- DropEnum
DROP TYPE "UniversityType";
