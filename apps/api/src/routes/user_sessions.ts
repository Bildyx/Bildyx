import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserSessionsSchema,
  GetUserSessionSchema,
  UserSessionSchema,
  PostUserSessionSchema,
  PutUserSessionSchema,
  DeleteUserSessionSchema,
  DeleteUserSessionsBulkSchema,
} from "../models/user_sessions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserSessions } from "../db/types";

export const user_sessions = {
  // 1. Get all sessions for a user
  getByUser: publicProcedure
    .route({
      method: "GET",
      summary: "List all sessions for a user",
      description: "Get all user sessions for a specific user",
      path: "/users/{userId}/sessions",
      tags: ["UserSession"],
    })
    .input(GetUserSessionsSchema)
    .output(z.array(UserSessionSchema))
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
        .selectFrom("user_sessions")
        .selectAll()
        .where("user_id", "=", input.userId)
        .orderBy("expires_at", "desc")
        .execute();
    }),

  // 2. Get a session by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user session",
      description: "Get a specific user session by its unique ID",
      path: "/sessions/{sessionId}",
      tags: ["UserSession"],
    })
    .input(GetUserSessionSchema)
    .output(UserSessionSchema)
    .handler(async ({ input }) => {
      const session = await database
        .selectFrom("user_sessions")
        .selectAll()
        .where("id", "=", input.sessionId)
        .executeTakeFirst();

      if (!session) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }

      return session;
    }),

  // 3. Create a new session
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user session",
      description: "Create a new user session entry",
      path: "/sessions",
      tags: ["UserSession"],
    })
    .input(PostUserSessionSchema)
    .output(UserSessionSchema)
    .handler(async ({ input }) => {
      const user = await database
        .selectFrom("users")
        .where("id", "=", input.user_id)
        .select("id")
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const session = await database
        .insertInto("user_sessions")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserSessions>)
        .returningAll()
        .executeTakeFirst();

      if (!session) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create session",
        });
      }

      return session;
    }),

  // 4. Revoke a session (update revoked_at)
  revoke: publicProcedure
    .route({
      method: "PATCH",
      summary: "Revoke a user session",
      description: "Revoke an existing user session by its ID",
      path: "/sessions/{sessionId}",
      tags: ["UserSession"],
    })
    .input(z.object({ sessionId: z.uuid() }).merge(PutUserSessionSchema))
    .output(UserSessionSchema)
    .handler(async ({ input }) => {
      const { sessionId, ...updates } = input;

      const session = await database
        .updateTable("user_sessions")
        .set({
          ...updates,
          revoked_at: updates.revoked_at ?? new Date(),
        } as Insertable<UserSessions>)
        .where("id", "=", sessionId)
        .returningAll()
        .executeTakeFirst();

      if (!session) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }

      return session;
    }),

  // 5. Supprimer une session par son ID
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user session",
      description: "Delete an existing user session by its ID",
      path: "/sessions/{sessionId}",
      tags: ["UserSession"],
    })
    .input(DeleteUserSessionSchema)
    .output(UserSessionSchema)
    .handler(async ({ input }) => {
      const session = await database
        .deleteFrom("user_sessions")
        .where("id", "=", input.sessionId)
        .returningAll()
        .executeTakeFirst();

      if (!session) {
        throw new ORPCError("NOT_FOUND", { message: "Session not found" });
      }

      return session;
    }),

  // 6. Supprimer plusieurs sessions (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user sessions",
      description: "Delete multiple user sessions by their IDs",
      path: "/sessions",
      tags: ["UserSession"],
    })
    .input(DeleteUserSessionsBulkSchema)
    .output(z.array(UserSessionSchema))
    .handler(async ({ input }) => {
      const { sessionIds } = input;

      if (sessionIds.length === 0) return [];

      return await database
        .deleteFrom("user_sessions")
        .where("id", "in", sessionIds)
        .returningAll()
        .execute();
    }),
};
