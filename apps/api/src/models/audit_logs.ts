import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const AuditLogSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  action: z.string(),
  ip_address: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  created_at: z.date(),
});

// GET
export const GetAuditLogsSchema = z.object({
  userId: zNullableUUID(),
  action: z.string().optional(),
});

export const GetAuditLogSchema = z.object({
  auditLogId: z.uuid(),
});

// POST
export const PostAuditLogSchema = z.object({
  user_id: z.uuid(),
  action: z.string().min(1),
  ip_address: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

// DELETE
export const DeleteAuditLogSchema = z.object({
  auditLogId: z.uuid(),
});

export const DeleteAuditLogsBulkSchema = z.object({
  auditLogIds: z.array(z.uuid()),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
export type PostAuditLog = z.infer<typeof PostAuditLogSchema>;
