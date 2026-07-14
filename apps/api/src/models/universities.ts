import { z } from "zod";
import { UniversityTypeEnum } from "./utils/enums";

const currentYear = () => new Date().getFullYear();

export const UniversitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  type: UniversityTypeEnum.nullable().optional(),
  description: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  country_id: z.string().length(2).nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  student_count: z.number().int().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
  local_name: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  established: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  undergraduates: z.number().int().min(0).nullable().optional(),
  postgraduates: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetUniversitiesSchema = z.object({
  name: z.string().optional(),
  type: UniversityTypeEnum.optional(),
  country_id: z.string().length(2).optional(),
  city_id: z.string().uuid().optional(),
});

export const GetUniversitySchema = z.object({
  universityId: z.string().uuid(),
});

// POST
export const PostUniversitySchema = UniversitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutUniversitySchema = PostUniversitySchema.partial();

// DELETE
export const DeleteUniversitySchema = z.object({
  universityId: z.string().uuid(),
});

export const DeleteUniversitiesBulkSchema = z.object({
  universityIds: z.array(z.string().uuid()),
});

export type University = z.infer<typeof UniversitySchema>;
export type PostUniversity = z.infer<typeof PostUniversitySchema>;
export type PutUniversity = z.infer<typeof PutUniversitySchema>;
