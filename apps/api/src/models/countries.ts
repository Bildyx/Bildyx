import { z } from "zod";

export const CountrySchema = z.object({
  id: z.string(),
  country_name: z.string(),
  serial_number: z.string().nullable(),
  capital_city_id: z.string().nullable(),
  currency: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  temperatures: z.string().nullable(),
  climate: z.string().nullable(),
  crime_rate: z.string().nullable(),
  income_inequality: z.string().nullable(),
  work_life_balance: z.string().nullable(),
  largest_companies: z.array(z.string()).nullable(),
  number_of_multinational_hqs: z.number().int().nullable(),
  median_salary: z.string().nullable(),
  cost_of_living: z.string().nullable(),
  median_home_price: z.string().nullable(),
  average_rent: z.string().nullable(),
  interesting_fact: z.string().nullable(),
  citizenship_process: z.string().nullable(),
  work_permit: z.string().nullable(),
  global_competitiveness_index: z.string().nullable(),
  level_of_globalization: z.string().nullable(),
  number_of_international_students: z.string().nullable(),
  number_of_foreign_companies: z.string().nullable(),
  personal_income_tax: z.string().nullable(),
  number_of_tourists: z.string().nullable(),
  number_of_airports: z.number().int().nullable(),
  quality_of_education: z.string().nullable(),
  degree_holders: z.string().nullable(),
  number_of_universities: z.number().int().nullable(),
  ethnic_groups: z.array(z.string()).nullable(),
  religion: z.array(z.string()).nullable(),
  cultural_values: z.string().nullable(),
  people_description: z.string().nullable(),
  population: z.string().nullable(),
  quality_of_life: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateCountrySchema = CountrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export const GetCountriesSchema = z.object({
  search: z.string().optional(),
});

export type Country = z.infer<typeof CountrySchema>;
export type CreateCountry = z.infer<typeof CreateCountrySchema>;
export type UpdateCountry = z.infer<typeof UpdateCountrySchema>;