import { z } from "zod";

export const StudyFieldSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  area: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetStudyFieldsSchema = z.object({
  name: z.string().optional(),
  area: z.string().optional(),
});

export const GetStudyFieldSchema = z.object({
  studyFieldId: z.string().uuid(),
});

// POST
export const PostStudyFieldSchema = StudyFieldSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutStudyFieldSchema = PostStudyFieldSchema.partial();

// DELETE
export const DeleteStudyFieldSchema = z.object({
  studyFieldId: z.string().uuid(),
});

export const DeleteStudyFieldsBulkSchema = z.object({
  studyFieldIds: z.array(z.string().uuid()),
});

export type StudyField = z.infer<typeof StudyFieldSchema>;
export type PostStudyField = z.infer<typeof PostStudyFieldSchema>;
export type PutStudyField = z.infer<typeof PutStudyFieldSchema>;
