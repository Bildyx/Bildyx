import { z } from "zod";

export const UniversityTypeEnum = z.enum(["ACADEMY", "GRANDE_ECOLE", "INSTITUTE", "ONLINE", "OTHER", "UNIVERSITY"]);

export const UniversitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  type: UniversityTypeEnum.nullable(),
  description: z.string().nullable(),
  website_url: z.string().nullable(),
  logo_url: z.string().nullable(),
  founded_year: z.number().int().nullable(),
  established: z.string().nullable(),
  localName: z.string().nullable(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  score: z.number().nullable(),
  country_id: z.string().uuid().nullable(),
  city_id: z.string().uuid().nullable(),
  is_public: z.boolean().nullable(),
  student_count: z.number().int().nullable(),
  undergraduates: z.number().int().nullable(),
  postgraduates: z.number().int().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateUniversitySchema = UniversitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateUniversitySchema = CreateUniversitySchema.partial();

export const GetUniversitiesSchema = z.object({
  search: z.string().optional(),
  type: UniversityTypeEnum.optional(),
  country_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
});

export type University = z.infer<typeof UniversitySchema>;
export type CreateUniversity = z.infer<typeof CreateUniversitySchema>;
export type UpdateUniversity = z.infer<typeof UpdateUniversitySchema>;