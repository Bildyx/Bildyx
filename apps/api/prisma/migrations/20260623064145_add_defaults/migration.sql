-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
