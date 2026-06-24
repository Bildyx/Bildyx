import { z } from "zod";

export const DegreeLevelEnum = z.enum(["BACHELOR", "ENGINEERING", "HIGH_SCHOOL", "LAW", "MASTER", "MBA", "MEDICAL", "OTHER", "PHD"]);

export const DegreeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  university_id: z.string().uuid(),
  level: DegreeLevelEnum.nullable(),
  field: z.string().nullable(),
  duration_years: z.number().nullable(),
  description: z.string().nullable(),
  language_of_instruction: z.string().nullable(),
  country_id: z.string().uuid().nullable(),
  tuition_currency: z.string().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateDegreeSchema = DegreeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateDegreeSchema = CreateDegreeSchema.partial();

export const GetDegreesSchema = z.object({
  search: z.string().optional(),
  level: DegreeLevelEnum.optional(),
  university_id: z.string().uuid().optional(),
  country_id: z.string().uuid().optional(),
});

export type Degree = z.infer<typeof DegreeSchema>;
export type CreateDegree = z.infer<typeof CreateDegreeSchema>;
export type UpdateDegree = z.infer<typeof UpdateDegreeSchema>;