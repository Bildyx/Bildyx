import { z } from "zod";
import { UserRoleEnum, UserStatusEnum } from "./utils/enums";

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  email_verified: z.boolean(),
  password_hash: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
  marketing_opt_in: z.boolean(),
  verification_code: z.string().nullable().optional(),
  verification_expires_at: z.date().nullable().optional(),
  last_verification_sent_at: z.date().nullable().optional(),
  reset_token: z.string().nullable().optional(),
  reset_expires_at: z.date().nullable().optional(),
  last_reset_sent_at: z.date().nullable().optional(),
  role: UserRoleEnum,
  status: UserStatusEnum,
  last_login_at: z.date().nullable().optional(),
  failed_login_attempts: z.number().int(),
  locked_until: z.date().nullable().optional(),
  password_changed_at: z.date().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetUsersSchema = z.object({
  email: z.string().optional(),
  role: UserRoleEnum.optional(),
  status: UserStatusEnum.optional(),
});

export const GetUserSchema = z.object({
  userId: z.uuid(),
});

// POST
export const PostUserSchema = z.object({
  email: z.email(),
  password_hash: z.string().min(1),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
  marketing_opt_in: z.boolean().optional(),
  role: UserRoleEnum.optional(),
  status: UserStatusEnum.optional(),
  metadata: z.any().nullable().optional(),
});

// PATCH
export const PutUserSchema = PostUserSchema.partial();

// DELETE
export const DeleteUserSchema = z.object({
  userId: z.uuid(),
});

export const DeleteUsersBulkSchema = z.object({
  userIds: z.array(z.uuid()),
});

export type User = z.infer<typeof UserSchema>;
export type PostUser = z.infer<typeof PostUserSchema>;
export type PutUser = z.infer<typeof PutUserSchema>;
