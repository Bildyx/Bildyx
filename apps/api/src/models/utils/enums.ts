import { z } from "zod";

export const CostOfLivingSchema = z.enum(["LOW", "MEDIAN", "HIGH"]);
export const QualityOfLifeSchema = z.enum(["LOW", "MEDIAN", "HIGH"]);

export const LanguageSchema = z.enum([
  "AFRIKAANS",
  "ALBANIAN",
  "AMHARIC",
  "ARABIC",
  "ARMENIAN",
  "AZERBAIJANI",
  "BASQUE",
  "BELARUSIAN",
  "BENGALI",
  "BOSNIAN",
  "BULGARIAN",
  "BURMESE",
  "CATALAN",
  "CEBUANO",
  "CHINESE_CANTONESE",
  "CHINESE_MANDARIN",
  "CROATIAN",
  "CZECH",
  "DANISH",
  "DUTCH",
  "ENGLISH",
  "ESPERANTO",
  "ESTONIAN",
  "FILIPINO",
  "FINNISH",
  "FRENCH",
  "GALICIAN",
  "GEORGIAN",
  "GERMAN",
  "GREEK",
  "GUJARATI",
  "HAITIAN_CREOLE",
  "HAUSA",
  "HEBREW",
  "HINDI",
  "HUNGARIAN",
  "ICELANDIC",
  "IGBO",
  "INDONESIAN",
  "IRISH",
  "ITALIAN",
  "JAPANESE",
  "JAVANESE",
  "KANNADA",
  "KAZAKH",
  "KHMER",
  "KOREAN",
  "KURDISH",
  "KYRGYZ",
  "LAO",
  "LATIN",
  "LATVIAN",
  "LITHUANIAN",
  "LUXEMBOURGISH",
  "MACEDONIAN",
  "MALAGASY",
  "MALAY",
  "MALAYALAM",
  "MALTESE",
  "MAORI",
  "MARATHI",
  "MONGOLIAN",
  "NEPALI",
  "NORWEGIAN",
  "PASHTO",
  "PERSIAN",
  "POLISH",
  "PORTUGUESE",
  "PUNJABI",
  "ROMANIAN",
  "RUSSIAN",
  "SAMOAN",
  "SERBIAN",
  "SHONA",
  "SINDHI",
  "SINHALA",
  "SLOVAK",
  "SLOVENIAN",
  "SOMALI",
  "SPANISH",
  "SUNDANESE",
  "SWAHILI",
  "SWEDISH",
  "TAJIK",
  "TAMIL",
  "TATAR",
  "TELUGU",
  "THAI",
  "TIBETAN",
  "TURKISH",
  "TURKMEN",
  "UKRAINIAN",
  "URDU",
  "UZBEK",
  "VIETNAMESE",
  "WELSH",
  "WOLOF",
  "XHOSA",
  "YIDDISH",
  "YORUBA",
  "ZULU",
]);

export const DifficultyLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

export const CertificationCategoryEnum = z.enum([
  "TECHNICAL",
  "PROFESSIONAL",
  "PROJECTMANAGEMENT",
  "VENDORPRODUCT",
  "LANGUAGE",
  "OTHER",
]);

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

export const GovernmentTypeEnum = z.enum([
  "ABSOLUTE_MONARCHY",
  "COMMUNIST",
  "CONSTITUTIONAL_MONARCHY",
  "FEDERATION",
  "MILITARY_JUNTA",
  "OTHER",
  "PARLIAMENTARY",
  "REPUBLIC",
  "THEOCRACY",
]);

// ---------------------------------------------------------------------------
// Degrees
// ---------------------------------------------------------------------------

export const DegreeLevelEnum = z.enum([
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "PHD",
]);

// ---------------------------------------------------------------------------
// Job Ads
// ---------------------------------------------------------------------------

export const ContractTypeEnum = z.enum([
  "APPRENTICESHIP",
  "FREELANCE",
  "FULL_TIME",
  "INTERNSHIP",
  "OTHER",
  "PART_TIME",
]);

export const RemotePolicyEnum = z.enum(["FULL_REMOTE", "HYBRID", "ON_SITE"]);

export const EducationLevelEnum = z.enum([
  "BACHELOR",
  "HIGH_SCHOOL",
  "MASTER",
  "NONE",
  "OTHER",
  "PHD",
]);

export const JobAdStatusEnum = z.enum([
  "CLOSED",
  "DRAFT",
  "FILLED",
  "PUBLISHED",
]);

// ---------------------------------------------------------------------------
// Job Ad Skills
// ---------------------------------------------------------------------------

export const SkillImportanceEnum = z.enum([
  "REQUIRED",
  "PREFERRED",
  "NICE_TO_HAVE",
]);

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export const JobCategoryEnum = z.enum([
  "ACADEMIC",
  "GOVERNMENT",
  "MILITARY",
  "NGO",
  "OTHER",
  "PRIVATE_SECTOR",
  "PUBLIC_SECTOR",
]);

export const SeniorityLevelEnum = z.enum([
  "C_LEVEL",
  "DIRECTOR",
  "ELECTED",
  "INTERN",
  "JUNIOR",
  "LEAD",
  "MID",
  "OTHER",
  "SENIOR",
]);

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export const OrganizationTypeEnum = z.enum([
  "COMPANY",
  "GOVERNMENT",
  "RESEARCH_INSTITUTE",
  "UNIVERSITY",
  "INTERNATIONAL_ORGANIZATION",
  "NGO",
  "NON_PROFIT",
  "SOCIETY",
  "CLUB",
  "ARMY",
  "OTHER",
]);

export const EmployeeCountRangeEnum = z.enum([
  "RANGE_1_10",
  "RANGE_11_50",
  "RANGE_51_200",
  "RANGE_201_1000",
  "RANGE_1001_5000",
  "RANGE_5000_PLUS",
]);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const SubjectCategoryEnum = z.enum([
  "SOFTWARE",
  "HARDWARE",
  "SERVICE",
  "PLATFORM",
  "API",
  "PHYSICAL_PRODUCT",
  "OTHER",
]);

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const SkillCategoryEnum = z.enum([
  "FRAMEWORK",
  "LANGUAGE",
  "METHODOLOGY",
  "OTHER",
  "SOFT",
  "TECHNICAL",
  "TOOL",
]);

// ---------------------------------------------------------------------------
// Universities
// ---------------------------------------------------------------------------

export const UniversityTypeEnum = z.enum([
  "ACADEMY",
  "GRANDE_ECOLE",
  "INSTITUTE",
  "ONLINE",
  "OTHER",
  "UNIVERSITY",
]);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const UserRoleEnum = z.enum([
  "ADMIN",
  "CANDIDATE",
  "MODERATOR",
  "ORGANISATION",
  "SUPER_ADMIN",
  "USER",
]);

export const UserStatusEnum = z.enum([
  "ACTIVE",
  "DELETED",
  "PENDING_VERIFICATION",
  "SUSPENDED",
]);
