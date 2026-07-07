-- CreateEnum
CREATE TYPE "CostOfLiving" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "QualityOfLife" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('AFRIKAANS', 'ALBANIAN', 'AMHARIC', 'ARABIC', 'ARMENIAN', 'AZERBAIJANI', 'BASQUE', 'BELARUSIAN', 'BENGALI', 'BOSNIAN', 'BULGARIAN', 'BURMESE', 'CATALAN', 'CEBUANO', 'CHINESE_MANDARIN', 'CHINESE_CANTONESE', 'CROATIAN', 'CZECH', 'DANISH', 'DUTCH', 'ENGLISH', 'ESPERANTO', 'ESTONIAN', 'FILIPINO', 'FINNISH', 'FRENCH', 'GALICIAN', 'GEORGIAN', 'GERMAN', 'GREEK', 'GUJARATI', 'HAITIAN_CREOLE', 'HAUSA', 'HEBREW', 'HINDI', 'HUNGARIAN', 'ICELANDIC', 'IGBO', 'INDONESIAN', 'IRISH', 'ITALIAN', 'JAPANESE', 'JAVANESE', 'KANNADA', 'KAZAKH', 'KHMER', 'KOREAN', 'KURDISH', 'KYRGYZ', 'LAO', 'LATIN', 'LATVIAN', 'LITHUANIAN', 'LUXEMBOURGISH', 'MACEDONIAN', 'MALAGASY', 'MALAY', 'MALAYALAM', 'MALTESE', 'MAORI', 'MARATHI', 'MONGOLIAN', 'NEPALI', 'NORWEGIAN', 'PASHTO', 'PERSIAN', 'POLISH', 'PORTUGUESE', 'PUNJABI', 'ROMANIAN', 'RUSSIAN', 'SAMOAN', 'SERBIAN', 'SHONA', 'SINDHI', 'SINHALA', 'SLOVAK', 'SLOVENIAN', 'SOMALI', 'SPANISH', 'SUNDANESE', 'SWAHILI', 'SWEDISH', 'TAJIK', 'TAMIL', 'TATAR', 'TELUGU', 'THAI', 'TIBETAN', 'TURKISH', 'TURKMEN', 'UKRAINIAN', 'URDU', 'UZBEK', 'VIETNAMESE', 'WELSH', 'WOLOF', 'XHOSA', 'YIDDISH', 'YORUBA', 'ZULU');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('PRIVATE_SECTOR', 'PUBLIC_SECTOR', 'GOVERNMENT', 'NGO', 'MILITARY', 'ACADEMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'DIRECTOR', 'C_LEVEL', 'ELECTED', 'OTHER');

-- CreateEnum
CREATE TYPE "JobAdStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'FREELANCE', 'INTERNSHIP', 'APPRENTICESHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "RemotePolicy" AS ENUM ('ON_SITE', 'HYBRID', 'FULL_REMOTE');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NONE', 'HIGH_SCHOOL', 'BACHELOR', 'MASTER', 'PHD', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillImportance" AS ENUM ('REQUIRED', 'PREFERRED', 'NICE_TO_HAVE');

-- CreateEnum
CREATE TYPE "OrganizationSubType" AS ENUM ('COMPANY', 'GOVERNMENT', 'RESEARCH_INSTITUTE', 'UNIVERSITY', 'INTERNATIONAL_ORGANIZATION', 'NGO', 'NON_PROFIT', 'SOCIETY', 'CLUB', 'ARMY', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeCountRange" AS ENUM ('RANGE_1_10', 'RANGE_11_50', 'RANGE_51_200', 'RANGE_201_1000', 'RANGE_1001_5000', 'RANGE_5000_PLUS');

-- CreateEnum
CREATE TYPE "UniversityType" AS ENUM ('UNIVERSITY', 'GRANDE_ECOLE', 'INSTITUTE', 'ACADEMY', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "GovernmentType" AS ENUM ('REPUBLIC', 'CONSTITUTIONAL_MONARCHY', 'ABSOLUTE_MONARCHY', 'FEDERATION', 'PARLIAMENTARY', 'COMMUNIST', 'THEOCRACY', 'MILITARY_JUNTA', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'SOFT', 'LANGUAGE', 'TOOL', 'FRAMEWORK', 'METHODOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "CertificationCategory" AS ENUM ('TECHNICAL', 'PROFESSIONAL', 'PROJECTMANAGEMENT', 'VENDORPRODUCT', 'LANGUAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "DegreeLevel" AS ENUM ('HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "SubjectCategory" AS ENUM ('SOFTWARE', 'HARDWARE', 'SERVICE', 'PLATFORM', 'API', 'PHYSICAL_PRODUCT', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN', 'CANDIDATE', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "EducationFieldType" AS ENUM ('MAJOR', 'MINOR');

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "metadata" JSONB,
    "score" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
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
    "main_industries" TEXT,
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
    "number_of_foreign_organizations" INTEGER,
    "personal_income_tax" TEXT,
    "number_of_tourists" INTEGER,
    "number_of_airports" INTEGER,
    "quality_of_education" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "top_universities" TEXT,
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
    "serial_number" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "is_capital" BOOLEAN NOT NULL DEFAULT false,
    "state_province" TEXT,
    "population" INTEGER,
    "number_of_multinational_hqs" INTEGER,
    "number_of_airports" INTEGER,
    "largest_organization" TEXT,
    "median_salary" INTEGER,
    "cost_of_living" "CostOfLiving",
    "median_home_price" INTEGER,
    "average_rent" INTEGER,
    "temperatures" TEXT,
    "climate" TEXT,
    "interesting_fact" TEXT,
    "degree_holders" TEXT,
    "number_of_universities" INTEGER,
    "top_universities" TEXT,
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
    "type" "OrganizationSubType",
    "legal_status" TEXT,
    "ownership" TEXT,
    "mission" TEXT,
    "known_for" TEXT[],
    "activities" TEXT[],
    "project" TEXT,
    "research_areas" TEXT[],
    "products" TEXT[],
    "services" TEXT[],
    "partnerships" TEXT[],
    "budget" TEXT,
    "founded" TEXT,
    "founder" TEXT,
    "equipments" TEXT,
    "score" INTEGER,
    "city_id" UUID,
    "numberOfEmployees" "EmployeeCountRange",
    "numberOfSubsidiaries" INTEGER,
    "parent_organization_id" UUID,
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
    "serial_number" TEXT NOT NULL,
    "category" "JobCategory",
    "description" TEXT,
    "seniority_level" "SeniorityLevel",
    "industry_id" UUID,
    "products" TEXT[],
    "tools_and_tech" TEXT[],
    "tags" TEXT[],
    "metadata" JSONB,
    "score" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "type" TEXT,
    "category" "SkillCategory",
    "categories" TEXT[],
    "description" TEXT,
    "icon_url" TEXT,
    "industry" TEXT,
    "difficulty" "DifficultyLevel",
    "used_in" TEXT[],
    "jobs" TEXT[],
    "product_categories" TEXT[],
    "common_fields_of_study" TEXT[],
    "related_abilities" TEXT[],
    "time_to_master" TEXT,
    "score" INTEGER,
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
    "serial_number" TEXT NOT NULL,
    "issuing_organization_id" UUID,
    "description" TEXT,
    "level" TEXT,
    "category" "CertificationCategory",
    "products" TEXT[],
    "jobs" TEXT[],
    "validity_duration_months" INTEGER,
    "difficulty" "DifficultyLevel",
    "website_url" TEXT,
    "score" INTEGER,
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
    "serial_number" TEXT NOT NULL,
    "type" "UniversityType",
    "description" TEXT,
    "website_url" TEXT,
    "logo_url" TEXT,
    "country_id" UUID,
    "city_id" UUID,
    "student_count" INTEGER,
    "metadata" JSONB,
    "score_university" DOUBLE PRECISION,
    "local_name" TEXT,
    "notes" TEXT,
    "established" TEXT,
    "score" INTEGER,
    "undergraduates" INTEGER,
    "postgraduates" INTEGER,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "degrees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "level" "DegreeLevel",
    "area" TEXT,
    "duration_years" DOUBLE PRECISION,
    "description" TEXT,
    "score" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "degrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "military_capabilities" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "military_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "short_description" TEXT,
    "category" "SubjectCategory",
    "competitors" TEXT[],
    "vendors" TEXT[],
    "fun_fact" TEXT,
    "organization_id" UUID,
    "website_url" TEXT,
    "logo_url" TEXT,
    "tags" TEXT[],
    "score" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyFields" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "area" TEXT,
    "description" TEXT,
    "score" INTEGER,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_ads" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,
    "job_id" UUID,
    "description" TEXT,
    "status" "JobAdStatus" NOT NULL DEFAULT 'DRAFT',
    "contract_type" "ContractType",
    "remote" "RemotePolicy",
    "country_id" UUID,
    "city_id" UUID,
    "salary_range" TEXT,
    "required_years_experience" INTEGER,
    "required_education_level" "EducationLevel",
    "application_url" TEXT,
    "application_email" TEXT,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "tags" TEXT[],
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_ad_skills" (
    "id" UUID NOT NULL,
    "job_ad_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "importance" "SkillImportance" NOT NULL DEFAULT 'REQUIRED',

    CONSTRAINT "job_ad_skills_pkey" PRIMARY KEY ("id")
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
    "organization_id" UUID,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "verification_code" TEXT,
    "verification_expires_at" TIMESTAMP(3),
    "last_verification_sent_at" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_expires_at" TIMESTAMP(3),
    "last_reset_sent_at" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
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
    "biography" TEXT,
    "country_id" UUID,
    "city_id" UUID,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "website_url" TEXT,
    "locale" TEXT DEFAULT 'fr',
    "timezone" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "current_job_id" UUID,
    "current_job_started_at" TIMESTAMP(3),
    "current_organization_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_certifications" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "obtained_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_educations" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "university_id" UUID,
    "degree_id" UUID,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "graduated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_education_fields" (
    "id" UUID NOT NULL,
    "user_education_id" UUID NOT NULL,
    "study_field_Id" UUID NOT NULL,
    "type" "EducationFieldType" NOT NULL,

    CONSTRAINT "user_education_fields_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "_OrganizationIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrganizationIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProductIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ProductIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RelatedIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RelatedIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryLargestOrganizations" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CountryLargestOrganizations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CityMainIndustries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CityMainIndustries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_working_area" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_working_area_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_serial_number_key" ON "industries"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "countries_serial_number_key" ON "countries"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "countries"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "cities_serial_number_key" ON "cities"("serial_number");

-- CreateIndex
CREATE INDEX "cities_country_id_idx" ON "cities"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_parent_organization_id_idx" ON "organizations"("parent_organization_id");

-- CreateIndex
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_serial_number_key" ON "jobs"("serial_number");

-- CreateIndex
CREATE INDEX "jobs_industry_id_idx" ON "jobs"("industry_id");

-- CreateIndex
CREATE INDEX "jobs_category_idx" ON "jobs"("category");

-- CreateIndex
CREATE INDEX "jobs_seniority_level_idx" ON "jobs"("seniority_level");

-- CreateIndex
CREATE UNIQUE INDEX "skills_serial_number_key" ON "skills"("serial_number");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_serial_number_key" ON "certifications"("serial_number");

-- CreateIndex
CREATE INDEX "certifications_issuing_organization_id_idx" ON "certifications"("issuing_organization_id");

-- CreateIndex
CREATE INDEX "certifications_category_idx" ON "certifications"("category");

-- CreateIndex
CREATE UNIQUE INDEX "universities_serial_number_key" ON "universities"("serial_number");

-- CreateIndex
CREATE INDEX "universities_country_id_idx" ON "universities"("country_id");

-- CreateIndex
CREATE INDEX "universities_city_id_idx" ON "universities"("city_id");

-- CreateIndex
CREATE INDEX "universities_type_idx" ON "universities"("type");

-- CreateIndex
CREATE UNIQUE INDEX "degrees_serial_number_key" ON "degrees"("serial_number");

-- CreateIndex
CREATE INDEX "degrees_level_idx" ON "degrees"("level");

-- CreateIndex
CREATE UNIQUE INDEX "military_capabilities_organization_id_key" ON "military_capabilities"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_serial_number_key" ON "subjects"("serial_number");

-- CreateIndex
CREATE INDEX "subjects_category_idx" ON "subjects"("category");

-- CreateIndex
CREATE INDEX "subjects_organization_id_idx" ON "subjects"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudyFields_serial_number_key" ON "StudyFields"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "job_ads_serial_number_key" ON "job_ads"("serial_number");

-- CreateIndex
CREATE INDEX "job_ads_organization_id_idx" ON "job_ads"("organization_id");

-- CreateIndex
CREATE INDEX "job_ads_job_id_idx" ON "job_ads"("job_id");

-- CreateIndex
CREATE INDEX "job_ads_country_id_idx" ON "job_ads"("country_id");

-- CreateIndex
CREATE INDEX "job_ads_city_id_idx" ON "job_ads"("city_id");

-- CreateIndex
CREATE INDEX "job_ads_status_idx" ON "job_ads"("status");

-- CreateIndex
CREATE INDEX "job_ads_contract_type_idx" ON "job_ads"("contract_type");

-- CreateIndex
CREATE INDEX "job_ads_remote_idx" ON "job_ads"("remote");

-- CreateIndex
CREATE INDEX "job_ads_published_at_idx" ON "job_ads"("published_at");

-- CreateIndex
CREATE INDEX "job_ad_skills_skill_id_idx" ON "job_ad_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_ad_skills_job_ad_id_skill_id_key" ON "job_ad_skills"("job_ad_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_organization_id_key" ON "users"("organization_id");

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
CREATE INDEX "user_profiles_current_organization_id_idx" ON "user_profiles"("current_organization_id");

-- CreateIndex
CREATE INDEX "user_certifications_certification_id_idx" ON "user_certifications"("certification_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_certifications_user_profile_id_certification_id_key" ON "user_certifications"("user_profile_id", "certification_id");

-- CreateIndex
CREATE INDEX "user_educations_university_id_idx" ON "user_educations"("university_id");

-- CreateIndex
CREATE INDEX "user_educations_user_profile_id_idx" ON "user_educations"("user_profile_id");

-- CreateIndex
CREATE INDEX "user_education_fields_study_field_Id_idx" ON "user_education_fields"("study_field_Id");

-- CreateIndex
CREATE INDEX "user_education_fields_type_idx" ON "user_education_fields"("type");

-- CreateIndex
CREATE UNIQUE INDEX "user_education_fields_user_education_id_study_field_Id_key" ON "user_education_fields"("user_education_id", "study_field_Id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "_OrganizationIndustries_B_index" ON "_OrganizationIndustries"("B");

-- CreateIndex
CREATE INDEX "_ProductIndustries_B_index" ON "_ProductIndustries"("B");

-- CreateIndex
CREATE INDEX "_RelatedIndustries_B_index" ON "_RelatedIndustries"("B");

-- CreateIndex
CREATE INDEX "_CountryLargestOrganizations_B_index" ON "_CountryLargestOrganizations"("B");

-- CreateIndex
CREATE INDEX "_CityMainIndustries_B_index" ON "_CityMainIndustries"("B");

-- CreateIndex
CREATE INDEX "_working_area_B_index" ON "_working_area"("B");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_issuing_organization_id_fkey" FOREIGN KEY ("issuing_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "military_capabilities" ADD CONSTRAINT "military_capabilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ads" ADD CONSTRAINT "job_ads_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ads" ADD CONSTRAINT "job_ads_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ads" ADD CONSTRAINT "job_ads_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ads" ADD CONSTRAINT "job_ads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ad_skills" ADD CONSTRAINT "job_ad_skills_job_ad_id_fkey" FOREIGN KEY ("job_ad_id") REFERENCES "job_ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ad_skills" ADD CONSTRAINT "job_ad_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_job_id_fkey" FOREIGN KEY ("current_job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_current_organization_id_fkey" FOREIGN KEY ("current_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_certifications" ADD CONSTRAINT "user_certifications_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_educations" ADD CONSTRAINT "user_educations_degree_id_fkey" FOREIGN KEY ("degree_id") REFERENCES "degrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_educations" ADD CONSTRAINT "user_educations_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_educations" ADD CONSTRAINT "user_educations_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_education_fields" ADD CONSTRAINT "user_education_fields_study_field_Id_fkey" FOREIGN KEY ("study_field_Id") REFERENCES "StudyFields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_education_fields" ADD CONSTRAINT "user_education_fields_user_education_id_fkey" FOREIGN KEY ("user_education_id") REFERENCES "user_educations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationIndustries" ADD CONSTRAINT "_OrganizationIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationIndustries" ADD CONSTRAINT "_OrganizationIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductIndustries" ADD CONSTRAINT "_ProductIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedIndustries" ADD CONSTRAINT "_RelatedIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedIndustries" ADD CONSTRAINT "_RelatedIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryLargestOrganizations" ADD CONSTRAINT "_CountryLargestOrganizations_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryLargestOrganizations" ADD CONSTRAINT "_CountryLargestOrganizations_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityMainIndustries" ADD CONSTRAINT "_CityMainIndustries_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CityMainIndustries" ADD CONSTRAINT "_CityMainIndustries_B_fkey" FOREIGN KEY ("B") REFERENCES "industries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_working_area" ADD CONSTRAINT "_working_area_A_fkey" FOREIGN KEY ("A") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_working_area" ADD CONSTRAINT "_working_area_B_fkey" FOREIGN KEY ("B") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
