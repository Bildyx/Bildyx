import { z } from "zod";
import { CostOfLivingSchema, LanguageSchema } from "./utils/enums";
import { zNullableInt, zNullableString, zNullableStringCoercive, zEnumArray } from "./utils/preprocessors";

export const CitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  country_id: z.string().length(2),
  currency: z.string().length(3),
  is_capital: z.boolean().optional().default(false),
  state_province: z.string().nullable().optional(),
  population: zNullableStringCoercive(),
  number_of_multinational_hqs: zNullableStringCoercive(),
  number_of_airports: z.number().int().min(0).nullable().optional(),
  largest_organization: zNullableString(),
  median_salary: z.number().int().min(0).nullable().optional(),
  cost_of_living: CostOfLivingSchema.nullable().optional(),
  median_home_price: z.number().int().min(0).nullable().optional(),
  average_rent: z.number().int().min(0).nullable().optional(),
  temperatures: z.string().nullable().optional(),
  climate: z.string().nullable().optional(),
  interesting_fact: z.string().nullable().optional(),
  degree_holders: z.string().nullable().optional(),
  number_of_universities: z.number().int().min(0).nullable().optional(),
  top_universities: zNullableString(),
  number_of_nationalities: zNullableStringCoercive(),
  language: zEnumArray(LanguageSchema),
  people_description: z.string().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetCitiesSchema = z.object({
  name: z.string().optional(),
  country_id: z.string().length(2).optional(),
});

export const GetCitySchema = z.object({
  cityId: z.string().uuid(),
});

// POST
export const PostCitySchema = CitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutCitySchema = PostCitySchema.partial();

// DELETE
export const DeleteCitySchema = z.object({
  cityId: z.string().uuid(),
});

export const DeleteCitiesBulkSchema = z.object({
  cityIds: z.array(z.string().uuid()),
});

export type City = z.infer<typeof CitySchema>;
export type PostCity = z.infer<typeof PostCitySchema>;
export type PutCity = z.infer<typeof PutCitySchema>;
