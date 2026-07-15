import { z } from "zod";
import {
  CostOfLivingSchema,
  GovernmentTypeEnum,
  LanguageSchema,
  QualityOfLifeSchema,
} from "./utils/enums";
import { zEnumArray, zNullableString, zNullableStringCoercive } from "./utils/preprocessors";

export const CountrySchema = z.object({
  iso_code: z.string().length(2),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  capital_name: z.string().nullable().optional(),
  flag_url: z.string().nullable().optional(),
  population: zNullableStringCoercive(),
  area_km2: z.number().min(0).nullable().optional(),
  gdp_usd: z.number().min(0).nullable().optional(),
  gdp_per_capita_usd: z.number().min(0).nullable().optional(),
  hdi: z.number().min(0).max(1).nullable().optional(),
  officialLanguages: zEnumArray(LanguageSchema),
  calling_code: z.string().nullable().optional(),
  government_type: GovernmentTypeEnum.nullable().optional(),
  quality_of_life: QualityOfLifeSchema.nullable().optional(),
  temperatures: z.string().nullable().optional(),
  climate: z.string().nullable().optional(),
  crime_rate: z.string().nullable().optional(),
  income_inequality: z.string().nullable().optional(),
  work_life_balance: z.string().nullable().optional(),
  main_industries: zNullableString(),
  number_of_multinational_hqs: zNullableStringCoercive(),
  currency: z.string().nullable().optional(),
  median_salary: z.number().min(0).nullable().optional(),
  median_home_price: z.number().min(0).nullable().optional(),
  average_rent: z.number().min(0).nullable().optional(),
  cost_of_living: CostOfLivingSchema.nullable().optional(),
  interesting_fact: z.string().nullable().optional(),
  citizenship_process: z.string().nullable().optional(),
  work_permit: z.string().nullable().optional(),
  global_competitiveness_index: zNullableStringCoercive(),
  level_of_globalisation: z.string().nullable().optional(),
  number_of_international_students: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
  number_of_foreign_organizations: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
  personal_income_tax: z.string().nullable().optional(),
  number_of_tourists: zNullableStringCoercive(),
  number_of_airports: zNullableStringCoercive(),
  quality_of_education: z.string().nullable().optional(),
  degree_holders: z.string().nullable().optional(),
  number_of_universities: z.number().int().min(0).nullable().optional(),
  top_universities: zNullableString(),
  ethnic_groups: zNullableString(),
  religion: zNullableString(),
  cultural_values: z.string().nullable().optional(),
  people_description: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetCountriesSchema = z.object({
  name: z.string().optional(),
});

export const GetCountrySchema = z.object({
  countryId: z.string().length(2),
});

// POST
export const PostCountrySchema = CountrySchema.omit({
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutCountrySchema = PostCountrySchema.partial();

// DELETE
export const DeleteCountrySchema = z.object({
  countryId: z.string().length(2),
});

export const DeleteCountriesBulkSchema = z.object({
  countryIds: z.array(z.string().length(2)),
});

export type Country = z.infer<typeof CountrySchema>;
export type PostCountry = z.infer<typeof PostCountrySchema>;
export type PutCountry = z.infer<typeof PutCountrySchema>;
