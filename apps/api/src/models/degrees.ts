import { z } from "zod";
import { DegreeLevelEnum } from "./utils/enums";

export const DegreeSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  level: DegreeLevelEnum.nullable().optional(),
  area: z.string().nullable().optional(),
  duration_years: z.number().min(0).nullable().optional(),
  description: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetDegreesSchema = z.object({
  name: z.string().optional(),
  level: DegreeLevelEnum.optional(),
});

export const GetDegreeSchema = z.object({
  degreeId: z.uuid(),
});

// POST
export const PostDegreeSchema = DegreeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutDegreeSchema = PostDegreeSchema.partial();

// DELETE
export const DeleteDegreeSchema = z.object({
  degreeId: z.uuid(),
});

export const DeleteDegreesBulkSchema = z.object({
  degreeIds: z.array(z.uuid()),
});

export type Degree = z.infer<typeof DegreeSchema>;
export type PostDegree = z.infer<typeof PostDegreeSchema>;
export type PutDegree = z.infer<typeof PutDegreeSchema>;
