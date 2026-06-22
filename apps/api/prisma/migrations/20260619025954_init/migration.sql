-- CreateEnum
CREATE TYPE "CertificationLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('PUBLIC', 'PRIVATE', 'NONPROFIT', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('B2B', 'B2C', 'B2B2C');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('TECHNICAL', 'SOFT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IMMEDIATE', 'TWO_WEEKS', 'ONE_MONTH', 'THREE_MONTHS', 'NOT_LOOKING');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'HIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "Seniority" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'VP', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "SkillImportance" AS ENUM ('REQUIRED', 'PREFERRED', 'NICE_TO_HAVE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'RESPONDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProposalDecision" AS ENUM ('PENDING', 'INTERESTED', 'NOT_INTERESTED', 'INTERVIEW_REQUESTED');

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "median_salary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "organization_name" TEXT NOT NULL,
    "category" TEXT,
    "founded" INTEGER,
    "company_type" "CompanyType",
    "headquarters_location" TEXT,
    "number_of_offices" INTEGER,
    "number_of_employees" TEXT,
    "subsidiaries_count" INTEGER,
    "known_for" TEXT,
    "parent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "type" "ProductType",
    "product_type" TEXT,
    "description" TEXT,
    "fun_fact" TEXT,
    "company_id" UUID,
    "company_name" TEXT,
    "external_competitors" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "level" "CertificationLevel",
    "description" TEXT,
    "issued_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tools_and_tech" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "type" "SkillType",
    "categories" TEXT[],
    "used_in" TEXT[],
    "product_categories" TEXT[],
    "common_fields_of_study" TEXT[],
    "related_abilities" TEXT[],
    "time_to_master" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "city_name" TEXT NOT NULL,
    "population" TEXT,
    "number_of_multinational_hqs" INTEGER,
    "number_of_airports" INTEGER,
    "largest_companies" TEXT[],
    "median_salary" TEXT,
    "cost_of_living" TEXT,
    "median_home_price" TEXT,
    "average_rent" TEXT,
    "temperatures" TEXT,
    "climate" TEXT,
    "interesting_fact" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "number_of_nationalities" TEXT,
    "languages" TEXT[],
    "people_description" TEXT,
    "country_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "country_name" TEXT NOT NULL,
    "quality_of_life" TEXT,
    "temperatures" TEXT,
    "climate" TEXT,
    "crime_rate" TEXT,
    "income_inequality" TEXT,
    "work_life_balance" TEXT,
    "population" TEXT,
    "currency" TEXT,
    "largest_companies" TEXT[],
    "number_of_multinational_hqs" INTEGER,
    "median_salary" TEXT,
    "personal_income_tax" TEXT,
    "cost_of_living" TEXT,
    "median_home_price" TEXT,
    "average_rent" TEXT,
    "interesting_fact" TEXT,
    "citizenship_process" TEXT,
    "work_permit" TEXT,
    "global_competitiveness_index" TEXT,
    "level_of_globalization" TEXT,
    "number_of_international_students" TEXT,
    "number_of_foreign_companies" TEXT,
    "number_of_tourists" TEXT,
    "number_of_airports" INTEGER,
    "quality_of_education" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "ethnic_groups" TEXT[],
    "languages" TEXT[],
    "religion" TEXT[],
    "cultural_values" TEXT,
    "people_description" TEXT,
    "capital_city_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "name" TEXT NOT NULL,
    "established" INTEGER,
    "type" TEXT,
    "location" TEXT,
    "total_students" INTEGER,
    "undergraduates" INTEGER,
    "postgraduates" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facts" (
    "id" UUID NOT NULL,
    "serial_number" TEXT,
    "hashtag_1" TEXT,
    "icon_1" TEXT,
    "hashtag_2" TEXT,
    "title" TEXT,
    "story" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "availability" "Availability",
    "status" "CandidateStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_city_id" UUID,
    "origin_country_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "proficiency" "ProficiencyLevel",
    "years_of_experience" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_languages" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" "ProficiencyLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_educations" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "university_id" UUID,
    "school_name" TEXT,
    "degree" TEXT,
    "field_of_study" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_certifications" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "date_obtained" DATE,
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_experiences" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "company_id" UUID,
    "company_name" TEXT,
    "job_id" UUID,
    "title" TEXT,
    "description" TEXT,
    "impact" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "city_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_products" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_accounts" (
    "id" UUID NOT NULL,
    "company_id" UUID,
    "contact_email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_members" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company_account_id" UUID NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "company_account_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "who_we_are" TEXT,
    "what_we_are_great_at" TEXT,
    "team_culture" TEXT,
    "how_we_work_together" TEXT,
    "not_for_you_if" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "job_title" TEXT,
    "photo_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_offices" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,

    CONSTRAINT "team_offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_products" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,

    CONSTRAINT "team_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" UUID NOT NULL,
    "company_account_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "job_id" UUID,
    "city_id" UUID,
    "country_id" UUID,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" TEXT,
    "employment_type" "EmploymentType",
    "seniority" "Seniority",
    "remote_type" "RemoteType",
    "status" "JobOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_skills" (
    "id" UUID NOT NULL,
    "job_offer_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "importance" "SkillImportance" NOT NULL DEFAULT 'REQUIRED',

    CONSTRAINT "job_offer_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_languages" (
    "id" UUID NOT NULL,
    "job_offer_id" UUID NOT NULL,
    "language" TEXT NOT NULL,
    "min_proficiency" "ProficiencyLevel" NOT NULL,

    CONSTRAINT "job_offer_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" UUID NOT NULL,
    "job_offer_id" UUID NOT NULL,
    "company_account_id" UUID NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "admin_note" TEXT,
    "sent_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_candidates" (
    "id" UUID NOT NULL,
    "proposal_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "admin_note" TEXT,
    "decision" "ProposalDecision" NOT NULL DEFAULT 'PENDING',
    "company_note" TEXT,
    "decided_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IndustryToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_IndustryToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IndustryToSkill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_IndustryToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompanyToIndustry" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CompanyToIndustry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductCompetitors" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductCompetitors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CertificationToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CertificationToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CertificationToJob" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CertificationToJob_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_JobToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobToSkill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_JobToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityToIndustry" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityToIndustry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityToUniversity" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityToUniversity_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryToIndustry" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryToIndustry_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryToUniversity" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryToUniversity_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobOfferToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_JobOfferToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_serial_number_key" ON "industries"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "companies_serial_number_key" ON "companies"("serial_number");

-- CreateIndex
CREATE INDEX "companies_parent_id_idx" ON "companies"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_serial_number_key" ON "products"("serial_number");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_serial_number_key" ON "certifications"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_serial_number_key" ON "jobs"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "skills_serial_number_key" ON "skills"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "cities_serial_number_key" ON "cities"("serial_number");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "countries_serial_number_key" ON "countries"("serial_number");

-- CreateIndex
CREATE INDEX "countries_capital_city_id_idx" ON "countries"("capital_city_id");

-- CreateIndex
CREATE UNIQUE INDEX "universities_serial_number_key" ON "universities"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "facts_serial_number_key" ON "facts"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_profile_id_key" ON "candidates"("profile_id");

-- CreateIndex
CREATE INDEX "candidates_current_city_id_idx" ON "candidates"("current_city_id");

-- CreateIndex
CREATE INDEX "candidates_origin_country_id_idx" ON "candidates"("origin_country_id");

-- CreateIndex
CREATE INDEX "candidates_status_idx" ON "candidates"("status");

-- CreateIndex
CREATE INDEX "candidate_skills_skill_id_idx" ON "candidate_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidate_id_skill_id_key" ON "candidate_skills"("candidate_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_languages_candidate_id_language_key" ON "candidate_languages"("candidate_id", "language");

-- CreateIndex
CREATE INDEX "candidate_educations_candidate_id_idx" ON "candidate_educations"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_educations_university_id_idx" ON "candidate_educations"("university_id");

-- CreateIndex
CREATE INDEX "candidate_certifications_certification_id_idx" ON "candidate_certifications"("certification_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_certifications_candidate_id_certification_id_key" ON "candidate_certifications"("candidate_id", "certification_id");

-- CreateIndex
CREATE INDEX "candidate_experiences_candidate_id_idx" ON "candidate_experiences"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_experiences_company_id_idx" ON "candidate_experiences"("company_id");

-- CreateIndex
CREATE INDEX "candidate_experiences_job_id_idx" ON "candidate_experiences"("job_id");

-- CreateIndex
CREATE INDEX "candidate_products_product_id_idx" ON "candidate_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_products_candidate_id_product_id_key" ON "candidate_products"("candidate_id", "product_id");

-- CreateIndex
CREATE INDEX "company_accounts_company_id_idx" ON "company_accounts"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_profile_id_key" ON "company_members"("profile_id");

-- CreateIndex
CREATE INDEX "company_members_company_account_id_idx" ON "company_members"("company_account_id");

-- CreateIndex
CREATE INDEX "teams_company_account_id_idx" ON "teams"("company_account_id");

-- CreateIndex
CREATE INDEX "team_members_team_id_idx" ON "team_members"("team_id");

-- CreateIndex
CREATE INDEX "team_offices_city_id_idx" ON "team_offices"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_offices_team_id_city_id_key" ON "team_offices"("team_id", "city_id");

-- CreateIndex
CREATE INDEX "team_products_product_id_idx" ON "team_products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_products_team_id_product_id_key" ON "team_products"("team_id", "product_id");

-- CreateIndex
CREATE INDEX "job_offers_company_account_id_idx" ON "job_offers"("company_account_id");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "job_offers"("status");

-- CreateIndex
CREATE INDEX "job_offers_job_id_idx" ON "job_offers"("job_id");

-- CreateIndex
CREATE INDEX "job_offers_city_id_idx" ON "job_offers"("city_id");

-- CreateIndex
CREATE INDEX "job_offer_skills_skill_id_idx" ON "job_offer_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_skills_job_offer_id_skill_id_key" ON "job_offer_skills"("job_offer_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_languages_job_offer_id_language_key" ON "job_offer_languages"("job_offer_id", "language");

-- CreateIndex
CREATE INDEX "proposals_job_offer_id_idx" ON "proposals"("job_offer_id");

-- CreateIndex
CREATE INDEX "proposals_company_account_id_idx" ON "proposals"("company_account_id");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "proposal_candidates_candidate_id_idx" ON "proposal_candidates"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_candidates_proposal_id_candidate_id_key" ON "proposal_candidates"("proposal_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_candidates_proposal_id_rank_key" ON "proposal_candidates"("proposal_id", "rank");

-- CreateIndex
CREATE INDEX "_IndustryToProduct_B_index" ON "_IndustryToProduct"("B");

-- CreateIndex
CREATE INDEX "_IndustryToSkill_B_index" ON "_IndustryToSkill"("B");

-- CreateIndex
CREATE INDEX "_CompanyToIndustry_B_index" ON "_CompanyToIndustry"("B");

-- CreateIndex
CREATE INDEX "_ProductCompetitors_B_index" ON "_ProductCompetitors"("B");

-- CreateIndex
CREATE INDEX "_CertificationToProduct_B_index" ON "_CertificationToProduct"("B");

-- CreateIndex
CREATE INDEX "_CertificationToJob_B_index" ON "_CertificationToJob"("B");

-- CreateIndex
CREATE INDEX "_JobToProduct_B_index" ON "_JobToProduct"("B");

-- CreateIndex
CREATE INDEX "_JobToSkill_B_index" ON "_JobToSkill"("B");

-- CreateIndex
CREATE INDEX "_CityToIndustry_B_index" ON "_CityToIndustry"("B");

-- CreateIndex
CREATE INDEX "_CityToUniversity_B_index" ON "_CityToUniversity"("B");

-- CreateIndex
CREATE INDEX "_CountryToIndustry_B_index" ON "_CountryToIndustry"("B");

-- CreateIndex
CREATE INDEX "_CountryToUniversity_B_index" ON "_CountryToUniversity"("B");

-- CreateIndex
CREATE INDEX "_JobOfferToProduct_B_index" ON "_JobOfferToProduct"("B");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_capital_city_id_fkey" FOREIGN KEY ("capital_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_current_city_id_fkey" FOREIGN KEY ("current_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_origin_country_id_fkey" FOREIGN KEY ("origin_country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_languages" ADD CONSTRAINT "candidate_languages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_educations" ADD CONSTRAINT "candidate_educations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_educations" ADD CONSTRAINT "candidate_educations_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_certifications" ADD CONSTRAINT "candidate_certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_certifications" ADD CONSTRAINT "candidate_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences" ADD CONSTRAINT "candidate_experiences_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences" ADD CONSTRAINT "candidate_experiences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences" ADD CONSTRAINT "candidate_experiences_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experiences" ADD CONSTRAINT "candidate_experiences_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_products" ADD CONSTRAINT "candidate_products_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_products" ADD CONSTRAINT "candidate_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_accounts" ADD CONSTRAINT "company_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_account_id_fkey" FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_company_account_id_fkey" FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_offices" ADD CONSTRAINT "team_offices_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_offices" ADD CONSTRAINT "team_offices_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_products" ADD CONSTRAINT "team_products_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_products" ADD CONSTRAINT "team_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_account_id_fkey" FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_languages" ADD CONSTRAINT "job_offer_languages_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_company_account_id_fkey" FOREIGN KEY ("company_account_id") REFERENCES "company_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_candidates" ADD CONSTRAINT "proposal_candidates_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_candidates" ADD CONSTRAINT "proposal_candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndustryToProduct" ADD CONSTRAINT "_IndustryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndustryToProduct" ADD CONSTRAINT "_IndustryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndustryToSkill" ADD CONSTRAINT "_IndustryToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IndustryToSkill" ADD CONSTRAINT "_IndustryToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToIndustry" ADD CONSTRAINT "_CompanyToIndustry_A_fkey" FOREIGN KEY ("A") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyToIndustry" ADD CONSTRAINT "_CompanyToIndustry_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCompetitors" ADD CONSTRAINT "_ProductCompetitors_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductCompetitors" ADD CONSTRAINT "_ProductCompetitors_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToProduct" ADD CONSTRAINT "_CertificationToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToProduct" ADD CONSTRAINT "_CertificationToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToJob" ADD CONSTRAINT "_CertificationToJob_A_fkey" FOREIGN KEY ("A") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CertificationToJob" ADD CONSTRAINT "_CertificationToJob_B_fkey" FOREIGN KEY ("B") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToProduct" ADD CONSTRAINT "_JobToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToProduct" ADD CONSTRAINT "_JobToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToIndustry" ADD CONSTRAINT "_CityToIndustry_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToIndustry" ADD CONSTRAINT "_CityToIndustry_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToUniversity" ADD CONSTRAINT "_CityToUniversity_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityToUniversity" ADD CONSTRAINT "_CityToUniversity_B_fkey" FOREIGN KEY ("B") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToIndustry" ADD CONSTRAINT "_CountryToIndustry_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToIndustry" ADD CONSTRAINT "_CountryToIndustry_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUniversity" ADD CONSTRAINT "_CountryToUniversity_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToUniversity" ADD CONSTRAINT "_CountryToUniversity_B_fkey" FOREIGN KEY ("B") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOfferToProduct" ADD CONSTRAINT "_JobOfferToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobOfferToProduct" ADD CONSTRAINT "_JobOfferToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
