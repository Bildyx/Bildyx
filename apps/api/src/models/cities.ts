import { z } from "zod";

export const CostOfLivingEnum = z.enum(["LOW", "MEDIAN", "HIGH"]);
export const LanguageEnum = z.enum(["AFRIKAANS", "ALBANIAN", "AMHARIC", "ARABIC", "ARMENIAN", "AZERBAIJANI", "BASQUE", "BELARUSIAN", "BENGALI", "BOSNIAN", "BULGARIAN", "BURMESE", "CATALAN", "CEBUANO", "CHINESE_CANTONESE", "CHINESE_MANDARIN", "CROATIAN", "CZECH", "DANISH", "DUTCH", "ENGLISH", "ESPERANTO", "ESTONIAN", "FILIPINO", "FINNISH", "FRENCH", "GALICIAN", "GEORGIAN", "GERMAN", "GREEK", "GUJARATI", "HAITIAN_CREOLE", "HAUSA", "HEBREW", "HINDI", "HUNGARIAN", "ICELANDIC", "IGBO", "INDONESIAN", "IRISH", "ITALIAN", "JAPANESE", "JAVANESE", "KANNADA", "KAZAKH", "KHMER", "KOREAN", "KURDISH", "KYRGYZ", "LAO", "LATIN", "LATVIAN", "LITHUANIAN", "LUXEMBOURGISH", "MACEDONIAN", "MALAGASY", "MALAY", "MALAYALAM", "MALTESE", "MAORI", "MARATHI", "MONGOLIAN", "NEPALI", "NORWEGIAN", "PASHTO", "PERSIAN", "POLISH", "PORTUGUESE", "PUNJABI", "ROMANIAN", "RUSSIAN", "SAMOAN", "SERBIAN", "SHONA", "SINDHI", "SINHALA", "SLOVAK", "SLOVENIAN", "SOMALI", "SPANISH", "SUNDANESE", "SWAHILI", "SWEDISH", "TAJIK", "TAMIL", "TATAR", "TELUGU", "THAI", "TIBETAN", "TURKISH", "TURKMEN", "UKRAINIAN", "URDU", "UZBEK", "VIETNAMESE", "WELSH", "WOLOF", "XHOSA", "YIDDISH", "YORUBA", "ZULU"]);

export const CitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  country_id: z.string().uuid(),
  state_province: z.string().nullable(),
  is_capital: z.boolean(),
  population: z.number().int().nullable(),
  number_of_multinational_hqs: z.number().int().nullable(),
  number_of_airports: z.number().int().nullable(),
  median_salary: z.number().int().nullable(),
  cost_of_living: CostOfLivingEnum.nullable(),
  median_home_price: z.number().int().nullable(),
  average_rent: z.number().int().nullable(),
  temperatures: z.string().nullable(),
  climate: z.string().nullable(),
  interesting_fact: z.string().nullable(),
  degree_holders: z.string().nullable(),
  number_of_universities: z.number().int().nullable(),
  number_of_nationalities: z.number().int().nullable(),
  language: LanguageEnum.nullable(),
  people_description: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateCitySchema = CitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateCitySchema = CreateCitySchema.partial();

export const GetCitiesSchema = z.object({
  search: z.string().optional(),
  country_id: z.string().uuid().optional(),
});

export type City = z.infer<typeof CitySchema>;
export type CreateCity = z.infer<typeof CreateCitySchema>;
export type UpdateCity = z.infer<typeof UpdateCitySchema>;