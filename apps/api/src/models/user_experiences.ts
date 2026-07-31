import { z } from "zod";

export const UserExperienceSchema = z.object({
  id: z.string().uuid(),
  user_profile_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_year: z.number().nullable().optional(),
  end_year: z.number().nullable().optional(),
  current: z.boolean().optional(),
});

// GET
export const GetUserExperiencesSchema = z.object({
  userProfileId: z.string().uuid(),
});

export const GetUserExperienceSchema = z.object({
  userExperienceId: z.string().uuid(),
});

// POST
export const PostUserExperienceSchema = z.object({
  user_profile_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_year: z.number().nullable().optional(),
  end_year: z.number().nullable().optional(),
  current: z.boolean().optional(),
});

// PATCH
export const PutUserExperienceSchema = z.object({
  organization_id: z.string().uuid().nullable().optional(),
  job_id: z.string().uuid().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  start_year: z.number().nullable().optional(),
  end_year: z.number().nullable().optional(),
  current: z.boolean().optional(),
});

// DELETE
export const DeleteUserExperienceSchema = z.object({
  userExperienceId: z.string().uuid(),
});

export const DeleteUserExperiencesBulkSchema = z.object({
  userExperienceIds: z.array(z.string().uuid()),
});

export type UserExperience = z.infer<typeof UserExperienceSchema>;
export type PostUserExperience = z.infer<typeof PostUserExperienceSchema>;
export type PutUserExperience = z.infer<typeof PutUserExperienceSchema>;
