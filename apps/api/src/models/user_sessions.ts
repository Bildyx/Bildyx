import { z } from "zod";

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  token_hash: z.string(),
  expires_at: z.date(),
  revoked_at: z.date().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  created_at: z.date(),
});

// GET
export const GetUserSessionsSchema = z.object({
  userId: z.string().uuid(),
});

export const GetUserSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

// POST
export const PostUserSessionSchema = z.object({
  user_id: z.string().uuid(),
  token_hash: z.string().min(1),
  expires_at: z.date(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

// PATCH
export const PutUserSessionSchema = z.object({
  revoked_at: z.date().nullable().optional(),
});

// DELETE
export const DeleteUserSessionSchema = z.object({
  sessionId: z.string().uuid(),
});

export const DeleteUserSessionsBulkSchema = z.object({
  sessionIds: z.array(z.string().uuid()),
});

export type UserSession = z.infer<typeof UserSessionSchema>;
export type PostUserSession = z.infer<typeof PostUserSessionSchema>;
export type PutUserSession = z.infer<typeof PutUserSessionSchema>;
