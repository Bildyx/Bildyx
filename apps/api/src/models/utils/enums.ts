import { z } from "zod";

export const CostOfLivingSchema = z.enum([
  "LOW",
  "LOW_MEDIUM",
  "MEDIUM",
  "MEDIUM_HIGH",
  "HIGH",
  "VERY_HIGH",
]);

export const QualityOfLifeSchema = z.enum([
  "LOW",
  "LOW_MEDIUM",
  "MEDIUM",
  "MEDIUM_HIGH",
  "HIGH",
  "VERY_HIGH",
]);

export const LanguageSchema = z.enum([
  "AFRIKAANS",
  "ALBANIAN",
  "AMBONESE_MALAY",
  "AMHARIC",
  "ARABIC",
  "ARMENIAN",
  "AYMARA",
  "AZERBAIJANI",
  "BAJAN_CREOLE",
  "BASQUE",
  "BELARUSIAN",
  "BENGALI",
  "BERBER",
  "BOSNIAN",
  "BULGARIAN",
  "BURMESE",
  "CATALAN",
  "CEBUANO",
  "CHAMORRO",
  "CHINESE_CANTONESE",
  "CHINESE_MANDARIN",
  "CORSICAN",
  "CROATIAN",
  "CZECH",
  "DANISH",
  "DHIVEHI",
  "DUTCH",
  "ENGLISH",
  "ESPERANTO",
  "ESTONIAN",
  "FILIPINO",
  "FINNISH",
  "FRENCH",
  "FRISIAN",
  "GALICIAN",
  "GEORGIAN",
  "GERMAN",
  "GREEK",
  "GUJARATI",
  "GUYANESE_CREOLE",
  "HAITIAN_CREOLE",
  "HAUSA",
  "HEBREW",
  "HINDI",
  "HMONG",
  "HUNGARIAN",
  "ICELANDIC",
  "IGBO",
  "INDONESIAN",
  "IRISH",
  "ITALIAN",
  "JAPANESE",
  "JAVANESE",
  "KANNADA",
  "KAPAMPANGAN",
  "KAZAKH",
  "KHMER",
  "KIMBUNDU",
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
  "MONTENEGRIN",
  "NAVAJO",
  "NEPALI",
  "NORWEGIAN",
  "PASHTO",
  "PERSIAN",
  "POLISH",
  "PORTUGUESE",
  "PUNJABI",
  "QUECHUA",
  "ROMANI",
  "ROMANIAN",
  "ROMANSH",
  "RUSSIAN",
  "SAMOAN",
  "SCOTS",
  "SCOTTISH_GAELIC",
  "SERBIAN",
  "SEYCHELLOIS_CREOLE",
  "SHONA",
  "SHUAR",
  "SINDHI",
  "SINHALA",
  "SLOVAK",
  "SLOVENIAN",
  "SOMALI",
  "SPANISH",
  "SUNDANESE",
  "SWAHILI",
  "SWEDISH",
  "TAGALOG",
  "TAJIK",
  "TAMIL",
  "TATAR",
  "TELUGU",
  "THAI",
  "TIBETAN",
  "TURKISH",
  "TURKMEN",
  "UKRAINIAN",
  "UMBUNDU",
  "URDU",
  "UZBEK",
  "VALENCIAN",
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

export const OrganizationSubtypeEnum = z.enum([
  "ARMY",
  "ASSOCIATION",
  "CENTRAL_BANK",
  "CHAMBER_OF_COMMERCE",
  "CITY_GOVERNMENT",
  "CLUB",
  "COMPANY",
  "COURT",
  "EMBASSY",
  "FOUNDATION",
  "GOVERNMENT",
  "HOSPITAL",
  "INTERNATIONAL_ORGANIZATION",
  "LIBRARY",
  "MUSEUM",
  "NATIONAL_AUDIT_OFFICE",
  "NATIONAL_PARK",
  "NGO",
  "NON_PROFIT",
  "OMBUDSMAN",
  "OTHER",
  "PRIMARY_SCHOOLS",
  "PUBLIC_COMPANY",
  "PUBLIC_PARKS",
  "RESEARCH_INSTITUTE",
  "SECONDARY_SCHOOLS",
  "SOCIETY",
  "SOE",
  "STATE_GOVERNMENT",
  "THINK_TANK",
  "UNIVERSITY",
]);

export const EmployeeCountRangeEnum = z.enum([
  "RANGE_1_10",
  "RANGE_11_50",
  "RANGE_51_200",
  "RANGE_201_1000",
  "RANGE_1001_5000",
  "RANGE_5000_PLUS",
  "CLASSIFIED",
]);

export const EducationFieldTypeEnum = z.enum(["MAJOR", "MINOR"]);

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
// Users
// ---------------------------------------------------------------------------

export const UserRoleEnum = z.enum(["ADMIN", "CANDIDATE", "ORGANIZATION"]);

export const UserStatusEnum = z.enum([
  "ACTIVE",
  "DELETED",
  "PENDING_VERIFICATION",
  "SUSPENDED",
]);

export const LanguageProficiencyEnum = z.enum([
  "BASIC",
  "CONVERSATIONAL",
  "FLUENT",
  "NATIVE",
  "PROFESSIONAL",
]);

const SUBTYPE_PREFIX_MAP: Record<string, string> = {
  COMPANY: "COM",
  GOVERNMENT: "GOV",
  RESEARCH_INSTITUTE: "RES",
  UNIVERSITY: "UNI",
  INTERNATIONAL_ORGANIZATION: "INT",
  NGO: "NGO",
  NON_PROFIT: "NPO",
  SOCIETY: "SOC",
  CLUB: "CLU",
  ARMY: "ARM",
  ASSOCIATION: "ASS",
  CENTRAL_BANK: "CEN",
  CHAMBER_OF_COMMERCE: "CHA",
  CITY_GOVERNMENT: "CIT",
  COURT: "COU",
  EMBASSY: "EMB",
  FOUNDATION: "FOU",
  HOSPITAL: "HOS",
  LIBRARY: "LIB",
  MUSEUM: "MUS",
  NATIONAL_AUDIT_OFFICE: "AUD",
  NATIONAL_PARK: "PAR",
  OMBUDSMAN: "OMB",
  PRIMARY_SCHOOLS: "SCH",
  PUBLIC_COMPANY: "PUB",
  PUBLIC_PARKS: "PKY",
  SECONDARY_SCHOOLS: "SEC",
  SOE: "SOE",
  STATE_GOVERNMENT: "STA",
  THINK_TANK: "THI",
  OTHER: "OTH"
};

export function generateSerialNumber(subtype?: string | null): string {
  const cleanSubtype = subtype ? subtype.trim().toUpperCase() : "";
  const prefix = SUBTYPE_PREFIX_MAP[cleanSubtype] || "COM";
  const num = Math.floor(1 + Math.random() * 999999);
  return `${prefix}-${String(num).padStart(6, "0")}`;
}
