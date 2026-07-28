-- Hand-written (no live DB available in this environment - verified instead
-- via `prisma migrate diff --from-empty --to-schema-datamodel` on the final
-- schema.prisma, cross-checking column/index/constraint names against that
-- output). This is phase 1 of 2 of the University -> Organization merge:
-- purely additive, safe to apply immediately. The `universities` table,
-- `user_educations.university_id`, `organizations.graduates`, and the
-- `UniversityType` enum are all left untouched here so the app keeps working
-- against both the old and new shape during the transition.
--
-- Order to apply in production:
--   1. this migration (additive)
--   2. prisma/migrate-universities-to-organizations.ts (data migration, not
--      run by this migration - see that file)
--   3. 20260728120100_drop_university_after_data_migration (destructive)

-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('BASIC', 'CONVERSATIONAL', 'PROFESSIONAL', 'FLUENT', 'NATIVE');

-- AlterTable: new academic fields on Organization (studentCount/postgraduates
-- new, undergraduates retyped TEXT -> INTEGER). The USING clause strips any
-- non-digit characters before casting so a stray unit/annotation in existing
-- data (e.g. "1200 students") degrades to NULL instead of failing the whole
-- migration - matches the project's existing toIntLoose()-style tolerance
-- for messy source data rather than a hard cast.
ALTER TABLE "organizations" ADD COLUMN "student_count" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "postgraduates" INTEGER;
ALTER TABLE "organizations" ALTER COLUMN "undergraduates" TYPE INTEGER USING (NULLIF(regexp_replace("undergraduates", '[^0-9]', '', 'g'), '')::INTEGER);

-- AlterTable: additive nullable FK, coexists with university_id until phase 2
ALTER TABLE "user_educations" ADD COLUMN "organization_id" UUID;

-- CreateIndex
CREATE INDEX "user_educations_organization_id_idx" ON "user_educations"("organization_id");

-- AddForeignKey
ALTER TABLE "user_educations" ADD CONSTRAINT "user_educations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user_experiences" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "organization_id" UUID,
    "job_id" UUID,
    "title" TEXT,
    "description" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_languages" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "language" "Language" NOT NULL,
    "proficiency" "LanguageProficiency",

    CONSTRAINT "user_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "level" "DifficultyLevel",

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_experiences_user_profile_id_idx" ON "user_experiences"("user_profile_id");
CREATE INDEX "user_experiences_organization_id_idx" ON "user_experiences"("organization_id");
CREATE INDEX "user_experiences_job_id_idx" ON "user_experiences"("job_id");
CREATE UNIQUE INDEX "user_languages_user_profile_id_language_key" ON "user_languages"("user_profile_id", "language");
CREATE INDEX "user_skills_skill_id_idx" ON "user_skills"("skill_id");
CREATE UNIQUE INDEX "user_skills_user_profile_id_skill_id_key" ON "user_skills"("user_profile_id", "skill_id");

-- AddForeignKey
ALTER TABLE "user_experiences" ADD CONSTRAINT "user_experiences_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_experiences" ADD CONSTRAINT "user_experiences_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_experiences" ADD CONSTRAINT "user_experiences_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_languages" ADD CONSTRAINT "user_languages_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
