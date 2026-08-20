import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserCertificationSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  certification_id: zNullableUUID(),
  obtained_at: z.coerce.date().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
});

// GET
export const GetUserCertificationsSchema = z.object({
  userProfileId: z.uuid(),
});

export const GetUserCertificationSchema = z.object({
  userCertificationId: z.uuid(),
});

// POST
export const PostUserCertificationSchema = UserCertificationSchema.omit({
  id: true,
});

// PATCH
export const PutUserCertificationSchema = PostUserCertificationSchema.partial();

// DELETE
export const DeleteUserCertificationSchema = z.object({
  userCertificationId: z.uuid(),
});

export const DeleteUserCertificationsBulkSchema = z.object({
  userCertificationIds: z.array(z.uuid()),
});

export type UserCertification = z.infer<typeof UserCertificationSchema>;
export type PostUserCertification = z.infer<typeof PostUserCertificationSchema>;
export type PutUserCertification = z.infer<typeof PutUserCertificationSchema>;
