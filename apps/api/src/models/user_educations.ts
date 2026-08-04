import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserEducationSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  organization_id: zNullableUUID(),
  degree_id: zNullableUUID(),
  start_year: z.number().int().nullable().optional(),
  end_year: z.number().int().nullable().optional(),
  graduated: z.boolean(),
});

// GET
export const GetUserEducationsSchema = z.object({
  userProfileId: z.uuid(),
});

export const GetUserEducationSchema = z.object({
  educationId: z.uuid(),
});

// POST
export const PostUserEducationSchema = z.object({
  user_profile_id: z.uuid(),
  organization_id: zNullableUUID(),
  degree_id: zNullableUUID(),
  start_year: z.number().int().nullable().optional(),
  end_year: z.number().int().nullable().optional(),
  graduated: z.boolean().optional(),
});

// PATCH
export const PutUserEducationSchema = PostUserEducationSchema.omit({
  user_profile_id: true,
}).partial();

// DELETE
export const DeleteUserEducationSchema = z.object({
  educationId: z.uuid(),
});

export const DeleteUserEducationsBulkSchema = z.object({
  educationIds: z.array(z.uuid()),
});

export type UserEducation = z.infer<typeof UserEducationSchema>;
export type PostUserEducation = z.infer<typeof PostUserEducationSchema>;
export type PutUserEducation = z.infer<typeof PutUserEducationSchema>;
