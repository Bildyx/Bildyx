import { z } from "zod";
import { CostOfLivingEnum, LanguageEnum } from "./cities";

export const QualityOfLifeEnum = z.enum(["LOW", "MEDIAN", "HIGH"]);
export const GovernmentTypeEnum = z.enum(["ABSOLUTE_MONARCHY", "COMMUNIST", "CONSTITUTIONAL_MONARCHY", "FEDERATION", "MILITARY_JUNTA", "OTHER", "PARLIAMENTARY", "REPUBLIC", "THEOCRACY"]);

export const CountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  iso_code: z.string().nullable(),
  capital_name: z.string().nullable(),
  flag_url: z.string().nullable(),
  population: z.string().nullable(),
  area_km2: z.number().nullable(),
  gdp_usd: z.number().nullable(),
  gdp_per_capita_usd: z.number().nullable(),
  hdi: z.number().nullable(),
  currency: z.string().nullable(),
  officialLanguages: z.array(LanguageEnum).nullable(),
  calling_code: z.string().nullable(),
  government_type: GovernmentTypeEnum.nullable(),
  quality_of_life: QualityOfLifeEnum.nullable(),
  temperatures: z.string().nullable(),
  climate: z.string().nullable(),
  crime_rate: z.string().nullable(),
  income_inequality: z.string().nullable(),
  work_life_balance: z.string().nullable(),
  number_of_multinational_hqs: z.number().int().nullable(),
  median_salary: z.number().int().nullable(),
  cost_of_living: CostOfLivingEnum.nullable(),
  median_home_price: z.number().int().nullable(),
  average_rent: z.number().int().nullable(),
  interesting_fact: z.string().nullable(),
  citizenship_process: z.string().nullable(),
  work_permit: z.string().nullable(),
  global_competitiveness_index: z.number().int().nullable(),
  level_of_globalisation: z.string().nullable(),
  number_of_international_students: z.number().int().nullable(),
  number_of_foreign_organizations: z.number().int().nullable(),
  personal_income_tax: z.string().nullable(),
  number_of_tourists: z.number().int().nullable(),
  number_of_airports: z.number().int().nullable(),
  quality_of_education: z.string().nullable(),
  degree_holders: z.string().nullable(),
  number_of_universities: z.number().int().nullable(),
  ethnic_groups: z.array(z.string()).nullable(),
  religion: z.array(z.string()).nullable(),
  cultural_values: z.string().nullable(),
  people_description: z.string().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateCountrySchema = CountrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export const GetCountriesSchema = z.object({
  search: z.string().optional(),
});

export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type UpdateCountry = z.infer<typeof UpdateCountrySchema>;