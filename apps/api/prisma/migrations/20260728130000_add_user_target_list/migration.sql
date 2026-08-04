-- Hand-written (no live DB available in this environment - verified instead
-- via `prisma migrate diff --from-empty --to-schema-datamodel` on the final
-- schema.prisma, cross-checking table/column/index/constraint names against
-- that output). Purely additive: new join table between UserProfile and
-- Organization, personal per-user list of companies a jobseeker plans to
-- apply to. Mirrors user_skills/user_experiences/user_languages conventions.

-- CreateTable
CREATE TABLE "user_target_lists" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_target_lists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_target_lists_organization_id_idx" ON "user_target_lists"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_target_lists_user_profile_id_organization_id_key" ON "user_target_lists"("user_profile_id", "organization_id");

-- AddForeignKey
ALTER TABLE "user_target_lists" ADD CONSTRAINT "user_target_lists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_target_lists" ADD CONSTRAINT "user_target_lists_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
