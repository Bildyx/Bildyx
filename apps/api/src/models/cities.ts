import { z } from "zod";

export const CitySchema = z.object({
  id: z.string(),
  city_name: z.string(),
  serial_number: z.string().nullable(),
  country_id: z.string().nullable(),
  population: z.string().nullable(),
  number_of_multinational_hqs: z.number().int().nullable(),
  number_of_airports: z.number().int().nullable(),
  largest_companies: z.array(z.string()).nullable(),
  median_salary: z.string().nullable(),
  cost_of_living: z.string().nullable(),
  median_home_price: z.string().nullable(),
  average_rent: z.string().nullable(),
  temperatures: z.string().nullable(),
  climate: z.string().nullable(),
  interesting_fact: z.string().nullable(),
  degree_holders: z.string().nullable(),
  number_of_universities: z.number().int().nullable(),
  number_of_nationalities: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  people_description: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateCitySchema = CitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCitySchema = CreateCitySchema.partial();

export const GetCitiesSchema = z.object({
  search: z.string().optional(),
  country_id: z.string().uuid().optional(),
});

export type City = z.infer<typeof CitySchema>;
export type CreateCity = z.infer<typeof CreateCitySchema>;
export type UpdateCity = z.infer<typeof UpdateCitySchema>;