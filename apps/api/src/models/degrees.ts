import { z } from "zod";

export const DegreeLevelEnum = z.enum([
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "PHD",
]);

export const DegreeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  university_id: z.string().uuid().nullable().optional(),
  level: DegreeLevelEnum.nullable().optional(),
  field: z.string().nullable().optional(),
  duration_years: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  language_of_instruction: z.string().nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateDegreeSchema = DegreeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
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
