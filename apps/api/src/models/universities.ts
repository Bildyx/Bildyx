import { z } from "zod";

export const UniversityTypeEnum = z.enum([
  "ACADEMY",
  "GRANDE_ECOLE",
  "INSTITUTE",
  "ONLINE",
  "OTHER",
  "UNIVERSITY",
]);

export const UniversitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  type: UniversityTypeEnum.nullable().optional(),
  description: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  founded_year: z.number().int().nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
  student_count: z.number().int().nullable().optional(),
  undergraduates: z.number().int().nullable().optional(),
  postgraduates: z.number().int().nullable().optional(),
  score: z.number().int().nullable().optional(),
  local_name: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  established: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateUniversitySchema = UniversitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
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
