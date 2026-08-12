import { z } from "zod";
import { SubjectCategoryEnum } from "./utils/enums";
import { zNullableUUID, zStringArray } from "./utils/preprocessors";

export const SubjectSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  category: SubjectCategoryEnum.nullable().optional(),
  competitors: zStringArray(),
  vendors: zStringArray(),
  fun_fact: z.string().nullable().optional(),
  organization_id: zNullableUUID(),
  website_url: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  tags: zStringArray(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetSubjectsSchema = z.object({
  name: z.string().optional(),
  category: SubjectCategoryEnum.optional(),
  organization_id: zNullableUUID(),
});

export const GetSubjectSchema = z.object({
  subjectId: z.uuid(),
});

// POST
export const PostSubjectSchema = SubjectSchema.omit({
  id: true,
});

// PATCH
export const PutSubjectSchema = PostSubjectSchema.partial();

// DELETE
export const DeleteSubjectSchema = z.object({
  subjectId: z.uuid(),
});

export const DeleteSubjectsBulkSchema = z.object({
  subjectIds: z.array(z.uuid()),
});

export type Subject = z.infer<typeof SubjectSchema>;
export type PostSubject = z.infer<typeof PostSubjectSchema>;
export type PutSubject = z.infer<typeof PutSubjectSchema>;
