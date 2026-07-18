-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CostOfLiving" ADD VALUE 'LOW_MEDIUM';
ALTER TYPE "CostOfLiving" ADD VALUE 'MEDIUM_HIGH';
ALTER TYPE "CostOfLiving" ADD VALUE 'VERY_HIGH';

-- AlterEnum
ALTER TYPE "EmployeeCountRange" ADD VALUE 'CLASSIFIED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Language" ADD VALUE 'AMBONESE_MALAY';
ALTER TYPE "Language" ADD VALUE 'AYMARA';
ALTER TYPE "Language" ADD VALUE 'BAJAN_CREOLE';
ALTER TYPE "Language" ADD VALUE 'BERBER';
ALTER TYPE "Language" ADD VALUE 'CHAMORRO';
ALTER TYPE "Language" ADD VALUE 'CORSICAN';
ALTER TYPE "Language" ADD VALUE 'DHIVEHI';
ALTER TYPE "Language" ADD VALUE 'FRISIAN';
ALTER TYPE "Language" ADD VALUE 'GUYANESE_CREOLE';
ALTER TYPE "Language" ADD VALUE 'HMONG';
ALTER TYPE "Language" ADD VALUE 'KAPAMPANGAN';
ALTER TYPE "Language" ADD VALUE 'KIMBUNDU';
ALTER TYPE "Language" ADD VALUE 'MONTENEGRIN';
ALTER TYPE "Language" ADD VALUE 'NAVAJO';
ALTER TYPE "Language" ADD VALUE 'QUECHUA';
ALTER TYPE "Language" ADD VALUE 'ROMANI';
ALTER TYPE "Language" ADD VALUE 'ROMANSH';
ALTER TYPE "Language" ADD VALUE 'SCOTS';
ALTER TYPE "Language" ADD VALUE 'SCOTTISH_GAELIC';
ALTER TYPE "Language" ADD VALUE 'SEYCHELLOIS_CREOLE';
ALTER TYPE "Language" ADD VALUE 'SHUAR';
ALTER TYPE "Language" ADD VALUE 'TAGALOG';
ALTER TYPE "Language" ADD VALUE 'UMBUNDU';
ALTER TYPE "Language" ADD VALUE 'VALENCIAN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationSubType" ADD VALUE 'ASSOCIATION';
ALTER TYPE "OrganizationSubType" ADD VALUE 'CENTRAL_BANK';
ALTER TYPE "OrganizationSubType" ADD VALUE 'CHAMBER_OF_COMMERCE';
ALTER TYPE "OrganizationSubType" ADD VALUE 'CITY_GOVERNMENT';
ALTER TYPE "OrganizationSubType" ADD VALUE 'COURT';
ALTER TYPE "OrganizationSubType" ADD VALUE 'EMBASSY';
ALTER TYPE "OrganizationSubType" ADD VALUE 'FOUNDATION';
ALTER TYPE "OrganizationSubType" ADD VALUE 'HOSPITAL';
ALTER TYPE "OrganizationSubType" ADD VALUE 'LIBRARY';
ALTER TYPE "OrganizationSubType" ADD VALUE 'MUSEUM';
ALTER TYPE "OrganizationSubType" ADD VALUE 'NATIONAL_AUDIT_OFFICE';
ALTER TYPE "OrganizationSubType" ADD VALUE 'NATIONAL_PARK';
ALTER TYPE "OrganizationSubType" ADD VALUE 'OMBUDSMAN';
ALTER TYPE "OrganizationSubType" ADD VALUE 'PRIMARY_SCHOOLS';
ALTER TYPE "OrganizationSubType" ADD VALUE 'PUBLIC_COMPANY';
ALTER TYPE "OrganizationSubType" ADD VALUE 'PUBLIC_PARKS';
ALTER TYPE "OrganizationSubType" ADD VALUE 'SECONDARY_SCHOOLS';
ALTER TYPE "OrganizationSubType" ADD VALUE 'SOE';
ALTER TYPE "OrganizationSubType" ADD VALUE 'STATE_GOVERNMENT';
ALTER TYPE "OrganizationSubType" ADD VALUE 'THINK_TANK';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QualityOfLife" ADD VALUE 'LOW_MEDIUM';
ALTER TYPE "QualityOfLife" ADD VALUE 'MEDIUM_HIGH';
ALTER TYPE "QualityOfLife" ADD VALUE 'VERY_HIGH';

-- DropForeignKey
ALTER TABLE "military_capabilities" DROP CONSTRAINT "military_capabilities_organization_id_fkey";

-- DropIndex
DROP INDEX "organizations_type_idx";

-- AlterTable
ALTER TABLE "_OrganizationCountries" RENAME CONSTRAINT "_CountryLargestOrganizations_AB_pkey" TO "_OrganizationCountries_AB_pkey";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "activities",
DROP COLUMN "equipments",
DROP COLUMN "founder",
DROP COLUMN "legal_status",
DROP COLUMN "numberOfSubsidiaries",
DROP COLUMN "partnerships",
DROP COLUMN "type",
ADD COLUMN     "authority" TEXT,
ADD COLUMN     "collections" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "facilities" TEXT[],
ADD COLUMN     "founders" TEXT[],
ADD COLUMN     "graduates" TEXT,
ADD COLUMN     "jurisdiction" TEXT,
ADD COLUMN     "members" INTEGER,
ADD COLUMN     "offices" TEXT,
ADD COLUMN     "partners" TEXT[],
ADD COLUMN     "personnel" INTEGER,
ADD COLUMN     "programs_activities" TEXT[],
ADD COLUMN     "serial_number" TEXT NOT NULL,
ADD COLUMN     "subsidiaries" TEXT,
ADD COLUMN     "subtype" "OrganizationSubType",
ADD COLUMN     "type1" TEXT,
ADD COLUMN     "type2" TEXT,
ADD COLUMN     "undergraduates" TEXT,
ALTER COLUMN "known_for" DROP NOT NULL,
ALTER COLUMN "known_for" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "military_capabilities";

-- CreateIndex
CREATE UNIQUE INDEX "organizations_serial_number_key" ON "organizations"("serial_number");

-- CreateIndex
CREATE INDEX "organizations_subtype_idx" ON "organizations"("subtype");

-- CreateIndex
CREATE INDEX "organizations_city_id_idx" ON "organizations"("city_id");

-- RenameIndex
ALTER INDEX "_CountryLargestOrganizations_B_index" RENAME TO "_OrganizationCountries_B_index";

