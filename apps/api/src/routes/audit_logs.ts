import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetAuditLogsSchema,
  GetAuditLogSchema,
  AuditLogSchema,
  PostAuditLogSchema,
  DeleteAuditLogSchema,
  DeleteAuditLogsBulkSchema,
} from "../models/audit_logs";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { AuditLogs } from "../db/types";

export const audit_logs = {
  // 1. Récupérer tous les logs d'audit
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all audit logs",
      description: "Get all audit logs with optional filters",
      path: "/audit-logs",
      tags: ["AuditLog"],
    })
    .input(GetAuditLogsSchema)
    .output(z.array(AuditLogSchema))
    .handler(async ({ input }) => {
      const { userId, action } = input;

      let query = database.selectFrom("audit_logs").selectAll();

      if (userId) {
        query = query.where("user_id", "=", userId);
      }

      if (action) {
        query = query.where("action", "ilike", `%${action.trim()}%`);
      }

      return await query.orderBy("created_at", "desc").execute();
    }),

  // 2. Récupérer tous les logs d'un utilisateur
  getByUser: publicProcedure
    .route({
      method: "GET",
      summary: "List audit logs for a user",
      description: "Get all audit logs for a specific user",
      path: "/users/{userId}/audit-logs",
      tags: ["AuditLog"],
    })
    .input(z.object({ userId: z.string().uuid() }))
    .output(z.array(AuditLogSchema))
    .handler(async ({ input }) => {
      const user = await database
        .selectFrom("users")
        .where("id", "=", input.userId)
        .select("id")
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      return await database
        .selectFrom("audit_logs")
        .selectAll()
        .where("user_id", "=", input.userId)
        .orderBy("created_at", "desc")
        .execute();
    }),

  // 3. Récupérer un log d'audit par son ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific audit log",
      description: "Get a specific audit log by its unique ID",
      path: "/audit-logs/{auditLogId}",
      tags: ["AuditLog"],
    })
    .input(GetAuditLogSchema)
    .output(AuditLogSchema)
    .handler(async ({ input }) => {
      const log = await database
        .selectFrom("audit_logs")
        .selectAll()
        .where("id", "=", input.auditLogId)
        .executeTakeFirst();

      if (!log) {
        throw new ORPCError("NOT_FOUND", { message: "Audit log not found" });
      }

      return log;
    }),

  // 4. Créer un log d'audit
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new audit log",
      description: "Record a new audit log entry",
      path: "/audit-logs",
      tags: ["AuditLog"],
    })
    .input(PostAuditLogSchema)
    .output(AuditLogSchema)
    .handler(async ({ input }) => {
      const user = await database
        .selectFrom("users")
        .where("id", "=", input.user_id)
        .select("id")
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const { metadata, ...rest } = input;

      const log = await database
        .insertInto("audit_logs")
        .values({
          ...rest,
          id: randomUUID(),
          metadata: metadata as any,
        } as Insertable<AuditLogs>)
        .returningAll()
        .executeTakeFirst();

      if (!log) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create audit log",
        });
      }

      return log;
    }),

  // 5. Supprimer un log d'audit
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete an audit log",
      description: "Delete an existing audit log by its ID",
      path: "/audit-logs/{auditLogId}",
      tags: ["AuditLog"],
    })
    .input(DeleteAuditLogSchema)
    .output(AuditLogSchema)
    .handler(async ({ input }) => {
      const log = await database
        .deleteFrom("audit_logs")
        .where("id", "=", input.auditLogId)
        .returningAll()
        .executeTakeFirst();

      if (!log) {
        throw new ORPCError("NOT_FOUND", { message: "Audit log not found" });
      }

      return log;
    }),

  // 6. Supprimer plusieurs logs (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple audit logs",
      description: "Delete multiple audit logs by their IDs",
      path: "/audit-logs",
      tags: ["AuditLog"],
    })
    .input(DeleteAuditLogsBulkSchema)
    .output(z.array(AuditLogSchema))
    .handler(async ({ input }) => {
      const { auditLogIds } = input;

      if (auditLogIds.length === 0) return [];

      return await database
        .deleteFrom("audit_logs")
        .where("id", "in", auditLogIds)
        .returningAll()
        .execute();
    }),
};
