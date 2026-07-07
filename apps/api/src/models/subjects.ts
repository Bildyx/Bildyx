import { z } from "zod";
import { SubjectCategoryEnum } from "./utils/enums";
import { zNullableUUID, zStringArray } from "./utils/preprocessors";

export const SubjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  category: SubjectCategoryEnum.nullable().optional(),
  competitors: zStringArray(),
  fun_fact: z.string().nullable().optional(),
  organization_id: zNullableUUID(),
  website_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  tags: zStringArray(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetSubjectsSchema = z.object({
  name: z.string().optional(),
  category: SubjectCategoryEnum.optional(),
  organization_id: z.string().uuid().optional(),
});

export const GetSubjectSchema = z.object({
  subjectId: z.string().uuid(),
});

// POST
export const PostSubjectSchema = SubjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutSubjectSchema = PostSubjectSchema.partial();

// DELETE
export const DeleteSubjectSchema = z.object({
  subjectId: z.string().uuid(),
});

export const DeleteSubjectsBulkSchema = z.object({
  subjectIds: z.array(z.string().uuid()),
});

export type Subject = z.infer<typeof SubjectSchema>;
export type PostSubject = z.infer<typeof PostSubjectSchema>;
export type PutSubject = z.infer<typeof PutSubjectSchema>;
