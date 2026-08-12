import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserExperienceSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  organization_id: zNullableUUID(),
  subject_id: zNullableUUID(),
  job_id: zNullableUUID(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_year: z.number().nullable().optional(),
  end_year: z.number().nullable().optional(),
  current: z.boolean().optional(),
});

// GET
export const GetUserExperiencesSchema = z.object({
  userProfileId: z.uuid(),
});

export const GetUserExperienceSchema = z.object({
  userExperienceId: z.uuid(),
});

// POST
export const PostUserExperienceSchema = UserExperienceSchema.omit({
  id: true,
});

// PATCH
export const PutUserExperienceSchema = PostUserExperienceSchema.partial();

// DELETE
export const DeleteUserExperienceSchema = z.object({
  userExperienceId: z.uuid(),
});

export const DeleteUserExperiencesBulkSchema = z.object({
  userExperienceIds: z.array(z.uuid()),
});

export type UserExperience = z.infer<typeof UserExperienceSchema>;
export type PostUserExperience = z.infer<typeof PostUserExperienceSchema>;
export type PutUserExperience = z.infer<typeof PutUserExperienceSchema>;
