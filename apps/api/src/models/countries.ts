import { z } from "zod";
import {
  CostOfLivingSchema,
  GovernmentTypeEnum,
  LanguageSchema,
  QualityOfLifeSchema,
} from "./utils/enums";

export const CountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  area_km2: z.number().min(0).nullable().optional(),
  average_rent: z.number().min(0).nullable().optional(),
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
  gdp_per_capita_usd: z.number().min(0).nullable().optional(),
  gdp_usd: z.number().min(0).nullable().optional(),
  global_competitiveness_index: z.number().min(0).nullable().optional(),
  government_type: GovernmentTypeEnum.nullable().optional(),
  hdi: z.number().min(0).max(1).nullable().optional(),
  income_inequality: z.string().nullable().optional(),
  interesting_fact: z.string().nullable().optional(),
  iso_code: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional(),
  ),
  level_of_globalisation: z.string().nullable().optional(),
  median_home_price: z.number().min(0).nullable().optional(),
  median_salary: z.number().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  number_of_airports: z.number().int().min(0).nullable().optional(),
  number_of_foreign_organizations: z.number().int().min(0).nullable().optional(),
  number_of_international_students: z.number().int().min(0).nullable().optional(),
  number_of_multinational_hqs: z.number().int().min(0).nullable().optional(),
  number_of_tourists: z.number().int().min(0).nullable().optional(),
  number_of_universities: z.number().int().min(0).nullable().optional(),
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
  deleted_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string(),
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export const GetCountriesSchema = z.object({
  name: z.string().optional(),
});
