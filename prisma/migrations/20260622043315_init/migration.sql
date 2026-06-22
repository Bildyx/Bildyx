-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('PRIVATE_SECTOR', 'PUBLIC_SECTOR', 'GOVERNMENT', 'NGO', 'MILITARY', 'ACADEMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'DIRECTOR', 'C_LEVEL', 'ELECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "RemotePolicy" AS ENUM ('ON_SITE', 'HYBRID', 'FULL_REMOTE');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NONE', 'HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillImportance" AS ENUM ('REQUIRED', 'PREFERRED', 'NICE_TO_HAVE');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('PRIVATE', 'PUBLIC', 'NGO', 'GOVERNMENT_MINISTRY', 'RESEARCH_INSTITUTE', 'INTERNATIONAL_ORG', 'POLITICAL_PARTY', 'MILITARY', 'STARTUP', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeCountRange" AS ENUM ('RANGE_1_10', 'RANGE_11_50', 'RANGE_51_200', 'RANGE_201_1000', 'RANGE_1001_5000', 'RANGE_5000_PLUS');

-- CreateEnum
CREATE TYPE "RevenueRange" AS ENUM ('UNDER_1M', 'RANGE_1M_10M', 'RANGE_10M_100M', 'RANGE_100M_1B', 'OVER_1B');

-- CreateEnum
CREATE TYPE "FactCategory" AS ENUM ('STATISTIC', 'HISTORICAL', 'LEGAL', 'SCIENTIFIC', 'GEOPOLITICAL', 'ECONOMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "UniversityType" AS ENUM ('UNIVERSITY', 'GRANDE_ECOLE', 'INSTITUTE', 'ACADEMY', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "Continent" AS ENUM ('AFRICA', 'ANTARCTICA', 'ASIA', 'EUROPE', 'NORTH_AMERICA', 'OCEANIA', 'SOUTH_AMERICA');

-- CreateEnum
CREATE TYPE "GovernmentType" AS ENUM ('REPUBLIC', 'CONSTITUTIONAL_MONARCHY', 'ABSOLUTE_MONARCHY', 'FEDERATION', 'PARLIAMENTARY', 'COMMUNIST', 'THEOCRACY', 'MILITARY_JUNTA', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'SOFT', 'LANGUAGE', 'TOOL', 'FRAMEWORK', 'METHODOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "CertificationCategory" AS ENUM ('PROFESSIONAL', 'TECHNICAL', 'QUALITY', 'COMPLIANCE', 'LANGUAGE', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "RecognitionLevel" AS ENUM ('GLOBAL', 'REGIONAL', 'NATIONAL', 'INDUSTRY_SPECIFIC');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'MBA', 'PHD', 'ENGINEERING', 'MEDICAL', 'LAW', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('SOFTWARE', 'HARDWARE', 'SERVICE', 'PLATFORM', 'API', 'PHYSICAL_PRODUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FREE', 'FREEMIUM', 'SUBSCRIPTION', 'ONE_TIME', 'OPEN_SOURCE', 'ENTERPRISE', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('JOB', 'JOB_OFFER', 'COMPANY', 'INDUSTRY', 'FACT', 'UNIVERSITY', 'COUNTRY', 'CITY', 'SKILL', 'CERTIFICATION', 'DEGREE', 'PRODUCT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'FOLLOW', 'BOOKMARK', 'REVIEW', 'NEW_CARD', 'UPDATE', 'OTHER');

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parent_industry_id" UUID,
    "nace_code" TEXT,
    "sic_code" TEXT,
    "icon_url" TEXT,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "name_fr" TEXT,
    "slug" TEXT NOT NULL,
    "iso_code_2" CHAR(2),
    "iso_code_3" CHAR(3),
    "continent" "Continent",
    "capital_name" TEXT,
    "flag_url" TEXT,
    "population" BIGINT,
    "area_km2" DOUBLE PRECISION,
    "gdp_usd" DOUBLE PRECISION,
    "gdp_per_capita_usd" DOUBLE PRECISION,
    "hdi" DOUBLE PRECISION,
    "currency" TEXT,
    "currency_code" CHAR(3),
    "official_languages" TEXT[],
    "calling_code" TEXT,
    "is_eu_member" BOOLEAN NOT NULL DEFAULT false,
    "is_nato_member" BOOLEAN NOT NULL DEFAULT false,
    "is_oecd_member" BOOLEAN NOT NULL DEFAULT false,
    "government_type" "GovernmentType",
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "region" TEXT,
    "department" TEXT,
    "population" INTEGER,
    "is_capital" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "elevation" INTEGER,
    "metro_population" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legal_name" TEXT,
    "type" "CompanyType",
    "description" TEXT,
    "short_description" TEXT,
    "logo_url" TEXT,
    "website_url" TEXT,
    "linkedin_url" TEXT,
    "founded_year" INTEGER,
    "dissolution_year" INTEGER,
    "headquarters_country_id" UUID,
    "headquarters_city_id" UUID,
    "employee_count_range" "EmployeeCountRange",
    "revenue_range" "RevenueRange",
    "is_publicly_traded" BOOLEAN NOT NULL DEFAULT false,
    "stock_ticker" TEXT,
    "stock_exchange" TEXT,
    "parent_company_id" UUID,
    "is_certified" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "JobCategory",
    "description" TEXT,
    "seniority_level" "SeniorityLevel",
    "is_elected" BOOLEAN NOT NULL DEFAULT false,
    "is_regulated" BOOLEAN NOT NULL DEFAULT false,
    "start_year" INTEGER,
    "industry_id" UUID,
    "country_id" UUID,
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "SkillCategory",
    "description" TEXT,
    "icon_url" TEXT,
    "industry_id" UUID,
    "difficulty" "DifficultyLevel",
    "is_verifiable" BOOLEAN NOT NULL DEFAULT false,
    "parent_skill_id" UUID,
    "aliases" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "issuing_organization_id" UUID,
    "description" TEXT,
    "category" "CertificationCategory",
    "validity_duration_months" INTEGER,
    "is_renewable" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" "DifficultyLevel",
    "cost" DOUBLE PRECISION,
    "cost_currency" CHAR(3),
    "website_url" TEXT,
    "logo_url" TEXT,
    "recognition_level" "RecognitionLevel",
    "prerequisites" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "official_name" TEXT,
    "acronym" TEXT,
    "type" "UniversityType",
    "description" TEXT,
    "website_url" TEXT,
    "logo_url" TEXT,
    "founded_year" INTEGER,
    "country_id" UUID,
    "city_id" UUID,
    "world_ranking" INTEGER,
    "shanghai_ranking" INTEGER,
    "the_ranking" INTEGER,
    "qs_ranking" INTEGER,
    "is_public" BOOLEAN,
    "acceptance_rate" DOUBLE PRECISION,
    "student_count" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degrees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "university_id" UUID NOT NULL,
    "level" "DegreeLevel",
    "field" TEXT,
    "duration_years" DOUBLE PRECISION,
    "description" TEXT,
    "is_accredited" BOOLEAN NOT NULL DEFAULT true,
    "is_distance_learning" BOOLEAN NOT NULL DEFAULT false,
    "language_of_instruction" TEXT,
    "country_id" UUID,
    "credits_required" INTEGER,
    "tuition_fee_min" DOUBLE PRECISION,
    "tuition_fee_max" DOUBLE PRECISION,
    "tuition_currency" CHAR(3),
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "degrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "category" "ProductCategory",
    "company_id" UUID,
    "website_url" TEXT,
    "logo_url" TEXT,
    "pricing_model" "PricingModel",
    "price_from" DOUBLE PRECISION,
    "price_currency" CHAR(3),
    "is_deprecated" BOOLEAN NOT NULL DEFAULT false,
    "launch_year" INTEGER,
    "documentation_url" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "category" "FactCategory",
    "source_url" TEXT,
    "source_title" TEXT,
    "published_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "related_country_id" UUID,
    "related_city_id" UUID,
    "related_company_id" UUID,
    "related_industry_id" UUID,
    "related_job_id" UUID,
    "related_university_id" UUID,
    "related_product_id" UUID,
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "job_id" UUID,
    "description" TEXT,
    "status" "JobOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "contract_type" "ContractType",
    "remote" "RemotePolicy",
    "country_id" UUID,
    "city_id" UUID,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" CHAR(3),
    "required_years_experience" INTEGER,
    "required_education_level" "EducationLevel",
    "application_url" TEXT,
    "application_email" TEXT,
    "number_of_positions" INTEGER,
    "benefits_description" TEXT,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
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
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "bio" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "locale" TEXT DEFAULT 'fr',
    "timezone" TEXT,
    "last_login_at" TIMESTAMP(3),
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "headline" TEXT,
    "biography" TEXT,
    "country_id" UUID,
    "city_id" UUID,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "github_url" TEXT,
    "website_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "current_job_id" UUID,
    "current_job_started_at" TIMESTAMP(3),
    "current_company_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "collection_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_views" (
    "id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "user_id" UUID,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_seconds" INTEGER,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_followings" (
    "id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_followings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompanyIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CompanyIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_slug_key" ON "industries"("slug");

-- CreateIndex
CREATE INDEX "industries_parent_industry_id_idx" ON "industries"("parent_industry_id");

-- CreateIndex
CREATE INDEX "industries_nace_code_idx" ON "industries"("nace_code");

-- CreateIndex
CREATE INDEX "industries_sic_code_idx" ON "industries"("sic_code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_slug_key" ON "countries"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_2_key" ON "countries"("iso_code_2");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_3_key" ON "countries"("iso_code_3");

-- CreateIndex
CREATE INDEX "countries_continent_idx" ON "countries"("continent");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE INDEX "cities_is_capital_idx" ON "cities"("is_capital");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_parent_company_id_idx" ON "companies"("parent_company_id");

-- CreateIndex
CREATE INDEX "companies_headquarters_country_id_idx" ON "companies"("headquarters_country_id");

-- CreateIndex
CREATE INDEX "companies_headquarters_city_id_idx" ON "companies"("headquarters_city_id");

-- CreateIndex
CREATE INDEX "companies_type_idx" ON "companies"("type");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");

-- CreateIndex
CREATE INDEX "jobs_industry_id_idx" ON "jobs"("industry_id");

-- CreateIndex
CREATE INDEX "jobs_country_id_idx" ON "jobs"("country_id");

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_seniority_level_idx" ON "jobs"("seniority_level");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "skills_industry_id_idx" ON "skills"("industry_id");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "skills_parent_skill_id_idx" ON "skills"("parent_skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_slug_key" ON "certifications"("slug");

-- CreateIndex
CREATE INDEX "certifications_issuing_organization_id_idx" ON "certifications"("issuing_organization_id");

-- CreateIndex
CREATE INDEX "certifications_category_idx" ON "certifications"("category");

-- CreateIndex
CREATE UNIQUE INDEX "universities_slug_key" ON "universities"("slug");

-- CreateIndex
CREATE INDEX "universities_country_id_idx" ON "universities"("country_id");

-- CreateIndex
CREATE INDEX "universities_city_id_idx" ON "universities"("city_id");

-- CreateIndex
CREATE INDEX "universities_type_idx" ON "universities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "degrees_slug_key" ON "degrees"("slug");

-- CreateIndex
CREATE INDEX "degrees_university_id_idx" ON "degrees"("university_id");

-- CreateIndex
CREATE INDEX "degrees_country_id_idx" ON "degrees"("country_id");

-- CreateIndex
CREATE INDEX "degrees_level_idx" ON "degrees"("level");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "facts_slug_key" ON "facts"("slug");

-- CreateIndex
CREATE INDEX "facts_related_country_id_idx" ON "facts"("related_country_id");

-- CreateIndex
CREATE INDEX "facts_related_city_id_idx" ON "facts"("related_city_id");

-- CreateIndex
CREATE INDEX "facts_related_company_id_idx" ON "facts"("related_company_id");

-- CreateIndex
CREATE INDEX "facts_related_industry_id_idx" ON "facts"("related_industry_id");

-- CreateIndex
CREATE INDEX "facts_related_job_id_idx" ON "facts"("related_job_id");

-- CreateIndex
CREATE INDEX "facts_related_university_id_idx" ON "facts"("related_university_id");

-- CreateIndex
CREATE INDEX "facts_related_product_id_idx" ON "facts"("related_product_id");

-- CreateIndex
CREATE INDEX "facts_category_idx" ON "facts"("category");

-- CreateIndex
CREATE INDEX "facts_is_verified_idx" ON "facts"("is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "job_offers_slug_key" ON "job_offers"("slug");

-- CreateIndex
CREATE INDEX "job_offers_company_id_idx" ON "job_offers"("company_id");

-- CreateIndex
CREATE INDEX "job_offers_job_id_idx" ON "job_offers"("job_id");

-- CreateIndex
CREATE INDEX "job_offers_country_id_idx" ON "job_offers"("country_id");

-- CreateIndex
CREATE INDEX "job_offers_city_id_idx" ON "job_offers"("city_id");

-- CreateIndex
CREATE INDEX "job_offers_status_idx" ON "job_offers"("status");

-- CreateIndex
CREATE INDEX "job_offers_contract_type_idx" ON "job_offers"("contract_type");

-- CreateIndex
CREATE INDEX "job_offers_remote_idx" ON "job_offers"("remote");

-- CreateIndex
CREATE INDEX "job_offers_published_at_idx" ON "job_offers"("published_at");

-- CreateIndex
CREATE INDEX "job_offer_skills_skill_id_idx" ON "job_offer_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_offer_skills_job_offer_id_skill_id_key" ON "job_offer_skills"("job_offer_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_country_id_idx" ON "user_profiles"("country_id");

-- CreateIndex
CREATE INDEX "user_profiles_city_id_idx" ON "user_profiles"("city_id");

-- CreateIndex
CREATE INDEX "user_profiles_current_job_id_idx" ON "user_profiles"("current_job_id");

-- CreateIndex
CREATE INDEX "user_profiles_current_company_id_idx" ON "user_profiles"("current_company_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "bookmarks_entity_type_entity_id_idx" ON "bookmarks"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_entity_type_entity_id_key" ON "bookmarks"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "card_views_entity_type_entity_id_idx" ON "card_views"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "card_views_user_id_idx" ON "card_views"("user_id");

-- CreateIndex
CREATE INDEX "card_views_viewed_at_idx" ON "card_views"("viewed_at");

-- CreateIndex
CREATE INDEX "reviews_entity_type_entity_id_idx" ON "reviews"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_entity_type_entity_id_key" ON "reviews"("user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_followings_entity_type_entity_id_idx" ON "user_followings"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_followings_follower_id_entity_type_entity_id_key" ON "user_followings"("follower_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "_ProductIndustries_B_index" ON "_ProductIndustries"("B");

-- CreateIndex
CREATE INDEX "_CompanyIndustries_B_index" ON "_CompanyIndustries"("B");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_parent_industry_id_fkey" FOREIGN KEY ("parent_industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_headquarters_country_id_fkey" FOREIGN KEY ("headquarters_country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_headquarters_city_id_fkey" FOREIGN KEY ("headquarters_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_parent_company_id_fkey" FOREIGN KEY ("parent_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_parent_skill_id_fkey" FOREIGN KEY ("parent_skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_issuing_organization_id_fkey" FOREIGN KEY ("issuing_organization_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degrees" ADD CONSTRAINT "degrees_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degrees" ADD CONSTRAINT "degrees_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_country_id_fkey" FOREIGN KEY ("related_country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_city_id_fkey" FOREIGN KEY ("related_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_company_id_fkey" FOREIGN KEY ("related_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_industry_id_fkey" FOREIGN KEY ("related_industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_university_id_fkey" FOREIGN KEY ("related_university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_job_id_fkey" FOREIGN KEY ("current_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_company_id_fkey" FOREIGN KEY ("current_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_followings" ADD CONSTRAINT "user_followings_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyIndustries" ADD CONSTRAINT "_CompanyIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyIndustries" ADD CONSTRAINT "_CompanyIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
