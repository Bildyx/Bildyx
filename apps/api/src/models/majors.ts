import { z } from "zod";

export const MajorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  area: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetMajorsSchema = z.object({
  name: z.string().optional(),
  area: z.string().optional(),
});

export const GetMajorSchema = z.object({
  majorId: z.string().uuid(),
});

// POST
export const PostMajorSchema = MajorSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutMajorSchema = PostMajorSchema.partial();

// DELETE
export const DeleteMajorSchema = z.object({
  majorId: z.string().uuid(),
});

export const DeleteMajorsBulkSchema = z.object({
  majorIds: z.array(z.string().uuid()),
});

export type Major = z.infer<typeof MajorSchema>;
export type PostMajor = z.infer<typeof PostMajorSchema>;
export type PutMajor = z.infer<typeof PutMajorSchema>;
