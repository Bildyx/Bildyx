import { z } from "zod";

export const EducationFieldTypeEnum = z.enum(["MAJOR", "MINOR"]);

export const UserEducationFieldSchema = z.object({
  id: z.string().uuid(),
  user_education_id: z.string().uuid(),
  study_field_Id: z.string().uuid(),
  type: EducationFieldTypeEnum,
});

// GET
export const GetUserEducationFieldsSchema = z.object({
  userEducationId: z.string().uuid(),
});

export const GetUserEducationFieldSchema = z.object({
  fieldId: z.string().uuid(),
});

// POST
export const PostUserEducationFieldSchema = z.object({
  user_education_id: z.string().uuid(),
  study_field_Id: z.string().uuid(),
  type: EducationFieldTypeEnum,
});

// PATCH
export const PutUserEducationFieldSchema = z.object({
  type: EducationFieldTypeEnum.optional(),
});

// DELETE
export const DeleteUserEducationFieldSchema = z.object({
  fieldId: z.string().uuid(),
});

export const DeleteUserEducationFieldsBulkSchema = z.object({
  fieldIds: z.array(z.string().uuid()),
});

export type UserEducationField = z.infer<typeof UserEducationFieldSchema>;
export type PostUserEducationField = z.infer<typeof PostUserEducationFieldSchema>;
export type PutUserEducationField = z.infer<typeof PutUserEducationFieldSchema>;
