import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUsersSchema,
  GetUserSchema,
  UserSchema,
  PostUserSchema,
  PutUserSchema,
  DeleteUserSchema,
  DeleteUsersBulkSchema,
} from "../models/users";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { Users } from "../db/types";

export const users = {
  // 1. Récupérer tous les utilisateurs
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all users",
      description: "Get all users with optional filters",
      path: "/users",
      tags: ["User"],
    })
    .input(GetUsersSchema)
    .output(z.array(UserSchema))
    .handler(async ({ input }) => {
      const { email, role, status } = input;

      let query = database
        .selectFrom("users")
        .where("deleted_at", "is", null)
        .selectAll();

      if (email) {
        query = query.where("email", "ilike", `%${email.trim()}%`);
      }

      if (role) {
        query = query.where("role", "=", role);
      }

      if (status) {
        query = query.where("status", "=", status);
      }

      return await query.orderBy("created_at", "desc").execute();
    }),

  // 2. Récupérer un utilisateur par son ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user",
      description: "Get a specific user by its unique ID",
      path: "/users/{userId}",
      tags: ["User"],
    })
    .input(GetUserSchema)
    .output(UserSchema)
    .handler(async ({ input }) => {
      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("id", "=", input.userId)
        .where("deleted_at", "is", null)
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      return user;
    }),

  // 3. Créer un nouvel utilisateur
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user",
      description: "Create a new user entry",
      path: "/users",
      tags: ["User"],
    })
    .input(PostUserSchema)
    .output(UserSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("users")
        .where("email", "=", input.email)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A user with this email already exists",
        });
      }

      const user = await database
        .insertInto("users")
        .values({
          id: randomUUID(),
          updated_at: new Date(),
          ...input,
        } as Insertable<Users>)
        .returningAll()
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user",
        });
      }

      return user;
    }),

  // 4. Mettre à jour un utilisateur
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user",
      description: "Update an existing user by its ID",
      path: "/users/{userId}",
      tags: ["User"],
    })
    .input(z.object({ userId: z.string().uuid() }).merge(PutUserSchema))
    .output(UserSchema)
    .handler(async ({ input }) => {
      const { userId, ...updates } = input;

      const existing = await database
        .selectFrom("users")
        .where("id", "=", userId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const user = await database
        .updateTable("users")
        .set({
          ...updates,
          updated_at: new Date(),
        } as Insertable<Users>)
        .where("id", "=", userId)
        .returningAll()
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update user",
        });
      }

      return user;
    }),

  // 5. Supprimer un utilisateur (soft delete)
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user",
      description: "Soft delete an existing user by its ID",
      path: "/users/{userId}",
      tags: ["User"],
    })
    .input(DeleteUserSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("users")
        .where("id", "=", input.userId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      await database
        .updateTable("users")
        .set({ deleted_at: new Date() })
        .where("id", "=", input.userId)
        .execute();
    }),

  // 6. Supprimer plusieurs utilisateurs (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple users",
      description: "Soft delete multiple existing users by their IDs",
      path: "/users",
      tags: ["User"],
    })
    .input(DeleteUsersBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      if (input.userIds.length === 0) return;

      await database
        .updateTable("users")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.userIds)
        .execute();
    }),
};
