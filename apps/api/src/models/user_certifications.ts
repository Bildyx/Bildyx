import { z } from "zod";

export const UserCertificationSchema = z.object({
  id: z.string().uuid(),
  user_profile_id: z.string().uuid(),
  certification_id: z.string().uuid(),
  obtained_at: z.date().nullable().optional(),
  expires_at: z.date().nullable().optional(),
});

// GET
export const GetUserCertificationsSchema = z.object({
  userProfileId: z.string().uuid(),
});

export const GetUserCertificationSchema = z.object({
  userCertificationId: z.string().uuid(),
});

// POST
export const PostUserCertificationSchema = z.object({
  user_profile_id: z.string().uuid(),
  certification_id: z.string().uuid(),
  obtained_at: z.coerce.date().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
});

// PATCH
export const PutUserCertificationSchema = z.object({
  obtained_at: z.coerce.date().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
});

// DELETE
export const DeleteUserCertificationSchema = z.object({
  userCertificationId: z.string().uuid(),
});

export const DeleteUserCertificationsBulkSchema = z.object({
  userCertificationIds: z.array(z.string().uuid()),
});

export type UserCertification = z.infer<typeof UserCertificationSchema>;
export type PostUserCertification = z.infer<typeof PostUserCertificationSchema>;
export type PutUserCertification = z.infer<typeof PutUserCertificationSchema>;
