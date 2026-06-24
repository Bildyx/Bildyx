-- CreateEnum
CREATE TYPE "CostOfLiving" AS ENUM ('LOW', 'MEDIAN', 'HIGH');

-- CreateEnum
CREATE TYPE "QualityOfLife" AS ENUM ('LOW', 'MEDIAN', 'HIGH');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('AFRIKAANS', 'ALBANIAN', 'AMHARIC', 'ARABIC', 'ARMENIAN', 'AZERBAIJANI', 'BASQUE', 'BELARUSIAN', 'BENGALI', 'BOSNIAN', 'BULGARIAN', 'BURMESE', 'CATALAN', 'CEBUANO', 'CHINESE_MANDARIN', 'CHINESE_CANTONESE', 'CROATIAN', 'CZECH', 'DANISH', 'DUTCH', 'ENGLISH', 'ESPERANTO', 'ESTONIAN', 'FILIPINO', 'FINNISH', 'FRENCH', 'GALICIAN', 'GEORGIAN', 'GERMAN', 'GREEK', 'GUJARATI', 'HAITIAN_CREOLE', 'HAUSA', 'HEBREW', 'HINDI', 'HUNGARIAN', 'ICELANDIC', 'IGBO', 'INDONESIAN', 'IRISH', 'ITALIAN', 'JAPANESE', 'JAVANESE', 'KANNADA', 'KAZAKH', 'KHMER', 'KOREAN', 'KURDISH', 'KYRGYZ', 'LAO', 'LATIN', 'LATVIAN', 'LITHUANIAN', 'LUXEMBOURGISH', 'MACEDONIAN', 'MALAGASY', 'MALAY', 'MALAYALAM', 'MALTESE', 'MAORI', 'MARATHI', 'MONGOLIAN', 'NEPALI', 'NORWEGIAN', 'PASHTO', 'PERSIAN', 'POLISH', 'PORTUGUESE', 'PUNJABI', 'ROMANIAN', 'RUSSIAN', 'SAMOAN', 'SERBIAN', 'SHONA', 'SINDHI', 'SINHALA', 'SLOVAK', 'SLOVENIAN', 'SOMALI', 'SPANISH', 'SUNDANESE', 'SWAHILI', 'SWEDISH', 'TAJIK', 'TAMIL', 'TATAR', 'TELUGU', 'THAI', 'TIBETAN', 'TURKISH', 'TURKMEN', 'UKRAINIAN', 'URDU', 'UZBEK', 'VIETNAMESE', 'WELSH', 'WOLOF', 'XHOSA', 'YIDDISH', 'YORUBA', 'ZULU');

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
CREATE TYPE "OrganizationType" AS ENUM ('COMPANY', 'NGO', 'GOVERNMENT_MINISTRY', 'RESEARCH_INSTITUTE', 'INTERNATIONAL_ORG', 'POLITICAL_PARTY', 'MILITARY', 'STARTUP', 'OTHER');

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
    "serialNumber" TEXT NOT NULL,
    "description" TEXT,
    "parent_industry_id" UUID,
    "nace_code" TEXT,
    "sic_code" TEXT,
    "icon_url" TEXT,
    "color" TEXT,
    "median_salary" INTEGER,
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
    "serialNumber" TEXT NOT NULL,
    "iso_code" CHAR(2),
    "capital_name" TEXT,
    "flag_url" TEXT,
    "population" BIGINT,
    "area_km2" DOUBLE PRECISION,
    "gdp_usd" DOUBLE PRECISION,
    "gdp_per_capita_usd" DOUBLE PRECISION,
    "hdi" DOUBLE PRECISION,
    "currency" TEXT,
    "officialLanguages" "Language"[],
    "calling_code" TEXT,
    "government_type" "GovernmentType",
    "quality_of_life" "QualityOfLife",
    "temperatures" TEXT,
    "climate" TEXT,
    "crime_rate" TEXT,
    "income_inequality" TEXT,
    "work_life_balance" TEXT,
    "number_of_multinational_hqs" INTEGER,
    "median_salary" INTEGER,
    "cost_of_living" "CostOfLiving",
    "median_home_price" INTEGER,
    "average_rent" INTEGER,
    "interesting_fact" TEXT,
    "citizenship_process" TEXT,
    "work_permit" TEXT,
    "global_competitiveness_index" INTEGER,
    "level_of_globalisation" TEXT,
    "number_of_international_students" INTEGER,
    "number_of_foreign_companies" INTEGER,
    "personal_income_tax" TEXT,
    "number_of_tourists" INTEGER,
    "number_of_airports" INTEGER,
    "quality_of_education" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "ethnic_groups" TEXT[],
    "religion" TEXT[],
    "cultural_values" TEXT,
    "people_description" TEXT,
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
    "serialNumber" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "region" TEXT,
    "department" TEXT,
    "population" INTEGER,
    "number_of_multinational_hqs" INTEGER,
    "number_of_airports" INTEGER,
    "median_salary" INTEGER,
    "cost_of_living" "CostOfLiving",
    "median_home_price" INTEGER,
    "average_rent" INTEGER,
    "temperatures" TEXT,
    "climate" TEXT,
    "interesting_fact" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "number_of_nationalities" INTEGER,
    "language" "Language",
    "people_description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType",
    "category" TEXT,
    "subsidiaries_count" INTEGER,
    "legal_status" TEXT,
    "ownership" TEXT,
    "mission" TEXT,
    "purpose" TEXT,
    "focus" TEXT,
    "focus_areas" TEXT[],
    "strategic_focus" TEXT,
    "known_for" TEXT[],
    "distinction" TEXT,
    "fields" TEXT[],
    "key_activities" TEXT[],
    "key_project" TEXT,
    "key_research_output" TEXT,
    "major_programs" TEXT[],
    "major_projects" TEXT[],
    "research_areas" TEXT[],
    "research_model" TEXT,
    "business_and_innovation" TEXT,
    "products" TEXT[],
    "services" TEXT[],
    "management_and_admin" TEXT,
    "main_organ" TEXT,
    "constituency" TEXT,
    "affiliation" TEXT,
    "collaborations" TEXT[],
    "partnerships" TEXT[],
    "funding_sources" TEXT[],
    "budget" TEXT,
    "endowment" TEXT,
    "gdp" TEXT,
    "founded" TEXT,
    "formed" TEXT,
    "formation" TEXT,
    "opened" TEXT,
    "dissolved" TEXT,
    "founder" TEXT,
    "headquarters" TEXT,
    "location" TEXT,
    "region_served" TEXT,
    "geography" TEXT,
    "total_land_area" TEXT,
    "population_of_city" TEXT,
    "number_of_offices" INTEGER,
    "number_of_employees" INTEGER,
    "number_of_members" INTEGER,
    "number_of_personnel" INTEGER,
    "number_of_volunteers" INTEGER,
    "number_of_government_ministries" INTEGER,
    "number_of_ministries" INTEGER,
    "scale" TEXT,
    "size" TEXT,
    "visitors" TEXT,
    "labs" TEXT[],
    "giant_facilities" TEXT[],
    "national_parks" TEXT[],
    "libraries_and_publications" TEXT,
    "tactical_units" TEXT[],
    "parent_organization_id" UUID,
    "parent_bureau" TEXT,
    "parent_department" TEXT,
    "parent_ministry" TEXT,
    "preceding_agency" TEXT,
    "preceding_bureau" TEXT,
    "preceding_department" TEXT,
    "superseding_agencies" TEXT[],
    "superseding_postal_system" TEXT,
    "number_of_active_navy_personnel" INTEGER,
    "number_of_destroyers" INTEGER,
    "number_of_submarines_diesel" INTEGER,
    "number_of_submarines_nuclear" INTEGER,
    "number_of_naval_shipyards" INTEGER,
    "number_of_maritime_patrol_aircraft" INTEGER,
    "number_of_stealth_fleet" INTEGER,
    "number_of_surveillance_radars" INTEGER,
    "number_of_aircrafts" INTEGER,
    "number_of_fighter_jets" INTEGER,
    "number_of_helicopters" INTEGER,
    "number_of_drones" INTEGER,
    "number_of_tanker_planes" INTEGER,
    "number_of_transport_planes" INTEGER,
    "number_of_communication_satellites" INTEGER,
    "number_of_missile_warning_satellites" INTEGER,
    "number_of_navigation_satellites" INTEGER,
    "number_of_spy_satellites" INTEGER,
    "number_of_satellite_jamming_systems" INTEGER,
    "number_of_surveillance_telescopes" INTEGER,
    "number_of_operational_spaceplanes" INTEGER,
    "number_of_space_launch_sites" INTEGER,
    "number_of_space_operations_squadrons" INTEGER,
    "number_of_space_personnel" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "category" "JobCategory",
    "description" TEXT,
    "seniority_level" "SeniorityLevel",
    "is_elected" BOOLEAN NOT NULL DEFAULT false,
    "is_regulated" BOOLEAN NOT NULL DEFAULT false,
    "start_year" INTEGER,
    "industry_id" UUID,
    "country_id" UUID,
    "products" TEXT[],
    "tools_and_tech" TEXT[],
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
    "serialNumber" TEXT NOT NULL,
    "type" TEXT,
    "category" "SkillCategory",
    "categories" TEXT[],
    "description" TEXT,
    "icon_url" TEXT,
    "industry_id" UUID,
    "difficulty" "DifficultyLevel",
    "used_in" TEXT[],
    "jobs" TEXT[],
    "product_categories" TEXT[],
    "common_fields_of_study" TEXT[],
    "related_abilities" TEXT[],
    "time_to_master" TEXT,
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
    "serialNumber" TEXT NOT NULL,
    "issuing_organization_id" UUID,
    "description" TEXT,
    "level" TEXT,
    "category" "CertificationCategory",
    "products" TEXT[],
    "jobs" TEXT[],
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
    "serialNumber" TEXT NOT NULL,
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
    "undergraduates" INTEGER,
    "postgraduates" INTEGER,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degrees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
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
    "serialNumber" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "short_description" TEXT,
    "category" "ProductCategory",
    "competitors" TEXT[],
    "fun_fact" TEXT,
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
    "serialNumber" TEXT NOT NULL,
    "content" TEXT,
    "hashtags" TEXT[],
    "icon" TEXT,
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
    "serialNumber" TEXT NOT NULL,
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
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
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
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
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
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompanyIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CompanyIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryMainIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryMainIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryLargestCompanies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryLargestCompanies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryTopUniversities" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryTopUniversities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityMainIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityMainIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityLargestCompanies" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityLargestCompanies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityTopUniversities" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityTopUniversities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_serialNumber_key" ON "industries"("serialNumber");

-- CreateIndex
CREATE INDEX "industries_parent_industry_id_idx" ON "industries"("parent_industry_id");

-- CreateIndex
CREATE INDEX "industries_nace_code_idx" ON "industries"("nace_code");

-- CreateIndex
CREATE INDEX "industries_sic_code_idx" ON "industries"("sic_code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_serialNumber_key" ON "countries"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "countries"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "cities_serialNumber_key" ON "cities"("serialNumber");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_parent_organization_id_idx" ON "organizations"("parent_organization_id");

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_serialNumber_key" ON "jobs"("serialNumber");

-- CreateIndex
CREATE INDEX "jobs_industry_id_idx" ON "jobs"("industry_id");

-- CreateIndex
CREATE INDEX "jobs_country_id_idx" ON "jobs"("country_id");

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_seniority_level_idx" ON "jobs"("seniority_level");

-- CreateIndex
CREATE UNIQUE INDEX "skills_serialNumber_key" ON "skills"("serialNumber");

-- CreateIndex
CREATE INDEX "skills_industry_id_idx" ON "skills"("industry_id");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "skills_parent_skill_id_idx" ON "skills"("parent_skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_serialNumber_key" ON "certifications"("serialNumber");

-- CreateIndex
CREATE INDEX "certifications_issuing_organization_id_idx" ON "certifications"("issuing_organization_id");

-- CreateIndex
CREATE INDEX "certifications_category_idx" ON "certifications"("category");

-- CreateIndex
CREATE UNIQUE INDEX "universities_serialNumber_key" ON "universities"("serialNumber");

-- CreateIndex
CREATE INDEX "universities_country_id_idx" ON "universities"("country_id");

-- CreateIndex
CREATE INDEX "universities_city_id_idx" ON "universities"("city_id");

-- CreateIndex
CREATE INDEX "universities_type_idx" ON "universities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "degrees_serialNumber_key" ON "degrees"("serialNumber");

-- CreateIndex
CREATE INDEX "degrees_university_id_idx" ON "degrees"("university_id");

-- CreateIndex
CREATE INDEX "degrees_country_id_idx" ON "degrees"("country_id");

-- CreateIndex
CREATE INDEX "degrees_level_idx" ON "degrees"("level");

-- CreateIndex
CREATE UNIQUE INDEX "products_serialNumber_key" ON "products"("serialNumber");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE UNIQUE INDEX "facts_serialNumber_key" ON "facts"("serialNumber");

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
CREATE UNIQUE INDEX "job_offers_serialNumber_key" ON "job_offers"("serialNumber");

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
CREATE UNIQUE INDEX "user_sessions_token_hash_key" ON "user_sessions"("token_hash");

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
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "_CompanyIndustries_B_index" ON "_CompanyIndustries"("B");

-- CreateIndex
CREATE INDEX "_ProductIndustries_B_index" ON "_ProductIndustries"("B");

-- CreateIndex
CREATE INDEX "_CountryMainIndustries_B_index" ON "_CountryMainIndustries"("B");

-- CreateIndex
CREATE INDEX "_CountryLargestCompanies_B_index" ON "_CountryLargestCompanies"("B");

-- CreateIndex
CREATE INDEX "_CountryTopUniversities_B_index" ON "_CountryTopUniversities"("B");

-- CreateIndex
CREATE INDEX "_CityMainIndustries_B_index" ON "_CityMainIndustries"("B");

-- CreateIndex
CREATE INDEX "_CityLargestCompanies_B_index" ON "_CityLargestCompanies"("B");

-- CreateIndex
CREATE INDEX "_CityTopUniversities_B_index" ON "_CityTopUniversities"("B");

-- AddForeignKey
ALTER TABLE "industries" ADD CONSTRAINT "industries_parent_industry_id_fkey" FOREIGN KEY ("parent_industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_parent_skill_id_fkey" FOREIGN KEY ("parent_skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_issuing_organization_id_fkey" FOREIGN KEY ("issuing_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degrees" ADD CONSTRAINT "degrees_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "degrees" ADD CONSTRAINT "degrees_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_country_id_fkey" FOREIGN KEY ("related_country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_city_id_fkey" FOREIGN KEY ("related_city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_company_id_fkey" FOREIGN KEY ("related_company_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_industry_id_fkey" FOREIGN KEY ("related_industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_university_id_fkey" FOREIGN KEY ("related_university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facts" ADD CONSTRAINT "facts_related_product_id_fkey" FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_company_id_fkey" FOREIGN KEY ("current_company_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyIndustries" ADD CONSTRAINT "_CompanyIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompanyIndustries" ADD CONSTRAINT "_CompanyIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryMainIndustries" ADD CONSTRAINT "_CountryMainIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryMainIndustries" ADD CONSTRAINT "_CountryMainIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryLargestCompanies" ADD CONSTRAINT "_CountryLargestCompanies_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryLargestCompanies" ADD CONSTRAINT "_CountryLargestCompanies_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryTopUniversities" ADD CONSTRAINT "_CountryTopUniversities_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryTopUniversities" ADD CONSTRAINT "_CountryTopUniversities_B_fkey" FOREIGN KEY ("B") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityMainIndustries" ADD CONSTRAINT "_CityMainIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityMainIndustries" ADD CONSTRAINT "_CityMainIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityLargestCompanies" ADD CONSTRAINT "_CityLargestCompanies_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityLargestCompanies" ADD CONSTRAINT "_CityLargestCompanies_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityTopUniversities" ADD CONSTRAINT "_CityTopUniversities_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityTopUniversities" ADD CONSTRAINT "_CityTopUniversities_B_fkey" FOREIGN KEY ("B") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
