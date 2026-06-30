import { z } from "zod";
import { CostOfLivingSchema, LanguageSchema } from "./utils/enums";

export const CitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  country_id: z.string().uuid(),
  is_capital: z.boolean().optional().default(false),
  state_province: z.string().nullable().optional(),
  population: z.number().int().min(0).nullable().optional(),
  number_of_multinational_hqs: z.number().int().min(0).nullable().optional(),
  number_of_airports: z.number().int().min(0).nullable().optional(),
  median_salary: z.number().int().min(0).nullable().optional(),
  cost_of_living: CostOfLivingSchema.nullable().optional(),
  median_home_price: z.number().int().min(0).nullable().optional(),
  average_rent: z.number().int().min(0).nullable().optional(),
  temperatures: z.string().nullable().optional(),
  climate: z.string().nullable().optional(),
  interesting_fact: z.string().nullable().optional(),
  degree_holders: z.string().nullable().optional(),
  number_of_universities: z.number().int().min(0).nullable().optional(),
  number_of_nationalities: z.number().int().min(0).nullable().optional(),
  language: LanguageSchema.nullable().optional(),
  people_description: z.string().nullable().optional(),
  // Coordonnées géographiques : latitude [-90, 90], longitude [-180, 180]
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateCitySchema = CitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
});

export const UpdateCitySchema = CreateCitySchema.partial();

export const GetCitiesSchema = z.object({
  search: z.string().optional(),
  country_id: z.string().uuid().optional(),
});

export type City = z.infer<typeof CitySchema>;
export type CreateCity = z.infer<typeof CreateCitySchema>;
export type UpdateCity = z.infer<typeof UpdateCitySchema>;
