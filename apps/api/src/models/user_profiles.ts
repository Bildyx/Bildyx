import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  biography: z.string().nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  linkedin_url: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  is_public: z.boolean(),
  current_job_id: z.string().uuid().nullable().optional(),
  current_job_started_at: z.date().nullable().optional(),
  current_organization_id: z.string().uuid().nullable().optional(),
  metadata: z.any().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetUserProfilesSchema = z.object({
  userId: z.string().uuid().optional(),
  countryId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
});

export const GetUserProfileSchema = z.object({
  profileId: z.string().uuid(),
});

export const GetUserProfileByUserSchema = z.object({
  userId: z.string().uuid(),
});

// POST
export const PostUserProfileSchema = z.object({
  user_id: z.string().uuid(),
  biography: z.string().nullable().optional(),
  country_id: zNullableUUID(),
  city_id: zNullableUUID(),
  linkedin_url: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  current_job_id: zNullableUUID(),
  current_job_started_at: z.date().nullable().optional(),
  current_organization_id: zNullableUUID(),
  metadata: z.any().nullable().optional(),
});

// PATCH
export const PutUserProfileSchema = PostUserProfileSchema.omit({ user_id: true }).partial();

// DELETE
export const DeleteUserProfileSchema = z.object({
  profileId: z.string().uuid(),
});

export const DeleteUserProfilesBulkSchema = z.object({
  profileIds: z.array(z.string().uuid()),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type PostUserProfile = z.infer<typeof PostUserProfileSchema>;
export type PutUserProfile = z.infer<typeof PutUserProfileSchema>;
