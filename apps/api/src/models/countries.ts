import { z } from "zod";

export const CostOfLivingSchema = z.enum(["HIGH", "LOW", "MEDIAN"]);
export const QualityOfLifeSchema = z.enum(["HIGH", "LOW", "MEDIAN"]);
export const GovernmentTypeSchema = z.enum([
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

export const CountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  area_km2: z.number().nullable().optional(),
  average_rent: z.number().nullable().optional(),
  calling_code: z.string().nullable().optional(),
  capital_name: z.string().nullable().optional(),
  citizenship_process: z.string().nullable().optional(),
  climate: z.string().nullable().optional(),
  cost_of_living: CostOfLivingSchema.nullable().optional(),
  crime_rate: z.string().nullable().optional(),
  cultural_values: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  degree_holders: z.string().nullable().optional(),
  flag_url: z.string().nullable().optional(),
  gdp_per_capita_usd: z.number().nullable().optional(),
  gdp_usd: z.number().nullable().optional(),
  global_competitiveness_index: z.number().nullable().optional(),
  government_type: GovernmentTypeSchema.nullable().optional(),
  hdi: z.number().nullable().optional(),
  income_inequality: z.string().nullable().optional(),
  interesting_fact: z.string().nullable().optional(),
  iso_code: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional(),
  ),
  level_of_globalisation: z.string().nullable().optional(),
  median_home_price: z.number().nullable().optional(),
  median_salary: z.number().nullable().optional(),
  metadata: z.any().nullable().optional(),
  number_of_airports: z.number().nullable().optional(),
  number_of_foreign_organizations: z.number().nullable().optional(),
  number_of_international_students: z.number().nullable().optional(),
  number_of_multinational_hqs: z.number().nullable().optional(),
  number_of_tourists: z.number().nullable().optional(),
  number_of_universities: z.number().nullable().optional(),
  officialLanguages: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(LanguageSchema).nullable().optional()),
  people_description: z.string().nullable().optional(),
  personal_income_tax: z.string().nullable().optional(),
  population: z.preprocess(
    (val) => (val === "" ? null : val),
    z
      .union([z.string(), z.number(), z.bigint()])
      .nullable()
      .optional()
      .transform((val) => (val == null ? val : val.toString())),
  ),
  quality_of_education: z.string().nullable().optional(),
  quality_of_life: QualityOfLifeSchema.nullable().optional(),
  religion: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  ethnic_groups: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  temperatures: z.string().nullable().optional(),
  work_life_balance: z.string().nullable().optional(),
  work_permit: z.string().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export type Country = z.infer<typeof CountrySchema>;

export const CreateCountrySchema = CountrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string(),
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export const GetCountriesSchema = z.object({
  name: z.string().optional(),
});
