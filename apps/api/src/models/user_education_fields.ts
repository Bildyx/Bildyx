import { z } from "zod";

export const EducationFieldTypeEnum = z.enum(["MAJOR", "MINOR"]);

export const UserEducationFieldSchema = z.object({
  id: z.uuid(),
  user_education_id: z.uuid(),
  study_field_Id: z.uuid(),
  type: EducationFieldTypeEnum,
});

// GET
export const GetUserEducationFieldsSchema = z.object({
  userEducationId: z.uuid(),
});

export const GetUserEducationFieldSchema = z.object({
  fieldId: z.uuid(),
});

// POST
export const PostUserEducationFieldSchema = z.object({
  user_education_id: z.uuid(),
  study_field_Id: z.uuid(),
  type: EducationFieldTypeEnum,
});

// PATCH
export const PutUserEducationFieldSchema = z.object({
  type: EducationFieldTypeEnum.optional(),
});

// DELETE
export const DeleteUserEducationFieldSchema = z.object({
  fieldId: z.uuid(),
});

export const DeleteUserEducationFieldsBulkSchema = z.object({
  fieldIds: z.array(z.uuid()),
});

export type UserEducationField = z.infer<typeof UserEducationFieldSchema>;
export type PostUserEducationField = z.infer<
  typeof PostUserEducationFieldSchema
>;
export type PutUserEducationField = z.infer<typeof PutUserEducationFieldSchema>;
