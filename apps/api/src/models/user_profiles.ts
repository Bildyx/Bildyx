import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserProfileSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  biography: z.string().nullable().optional(),
  country_id: z.string().length(2).nullable().optional(),
  city_id: zNullableUUID(),
  linkedin_url: z.string().nullable().optional(),
  github_url: z.string().nullable().optional(),
  website_url: z.string().nullable().optional(),
  is_public: z.boolean(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

// GET
export const GetUserProfilesSchema = z.object({
  userId: zNullableUUID(),
  countryId: z.string().length(2).optional(),
  cityId: zNullableUUID(),
  excludeOrganizations: z.boolean().optional().or(z.string().transform((v) => v === "true")),
});

export const GetUserProfileSchema = z.object({
  profileId: z.uuid(),
});

export const GetUserProfileByUserSchema = z.object({
  userId: z.uuid(),
});

// POST
export const PostUserProfileSchema = UserProfileSchema.omit({
  id: true,
});

// PATCH
export const PutUserProfileSchema = PostUserProfileSchema.partial();

// DELETE
export const DeleteUserProfileSchema = z.object({
  profileId: z.uuid(),
});

export const DeleteUserProfilesBulkSchema = z.object({
  profileIds: z.array(z.uuid()),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type PostUserProfile = z.infer<typeof PostUserProfileSchema>;
export type PutUserProfile = z.infer<typeof PutUserProfileSchema>;
