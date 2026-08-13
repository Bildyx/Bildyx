import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const SubjectCategorySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  parent_id: zNullableUUID(),
});

// GET
export const GetSubjectCategoriesSchema = z.object({
  name: z.string().optional(),
  parent_id: zNullableUUID(),
});

export const GetSubjectCategorySchema = z.object({
  subjectCategoryId: z.uuid(),
});

// POST
export const PostSubjectCategorySchema = SubjectCategorySchema.omit({
  id: true,
});

// PATCH
export const PutSubjectCategorySchema = PostSubjectCategorySchema.partial();

// DELETE
export const DeleteSubjectCategorySchema = z.object({
  subjectCategoryId: z.uuid(),
});

export const DeleteSubjectCategoriesBulkSchema = z.object({
  subjectCategoryIds: z.array(z.uuid()),
});

export type SubjectCategory = z.infer<typeof SubjectCategorySchema>;
export type PostSubjectCategory = z.infer<typeof PostSubjectCategorySchema>;
export type PutSubjectCategory = z.infer<typeof PutSubjectCategorySchema>;
