import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserProfilesSchema,
  GetUserProfileSchema,
  GetUserProfileByUserSchema,
  UserProfileSchema,
  PostUserProfileSchema,
  PutUserProfileSchema,
  DeleteUserProfileSchema,
  DeleteUserProfilesBulkSchema,
} from "../models/user_profiles";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserProfiles } from "../db/types";

export const user_profiles = {
  // 1. Récupérer tous les profils
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all user profiles",
      description: "Get all user profiles with optional filters",
      path: "/profiles",
      tags: ["UserProfile"],
    })
    .input(GetUserProfilesSchema)
    .output(z.array(UserProfileSchema))
    .handler(async ({ input }) => {
      const { userId, countryId, cityId } = input;

      let query = database.selectFrom("user_profiles").selectAll();

      if (userId) {
        query = query.where("user_id", "=", userId);
      }

      if (countryId) {
        query = query.where("country_id", "=", countryId);
      }

      if (cityId) {
        query = query.where("city_id", "=", cityId);
      }

      return await query.orderBy("created_at", "desc").execute();
    }),

  // 2. Récupérer un profil par son ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user profile",
      description: "Get a specific user profile by its unique ID",
      path: "/profiles/{profileId}",
      tags: ["UserProfile"],
    })
    .input(GetUserProfileSchema)
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .selectAll()
        .where("id", "=", input.profileId)
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return profile;
    }),

  // 3. Récupérer le profil d'un utilisateur par userId
  getByUser: publicProcedure
    .route({
      method: "GET",
      summary: "Get user profile by user ID",
      description: "Get a user profile by the owner's user ID",
      path: "/users/{userId}/profile",
      tags: ["UserProfile"],
    })
    .input(GetUserProfileByUserSchema)
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .selectAll()
        .where("user_id", "=", input.userId)
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return profile;
    }),

  // 4. Créer un nouveau profil
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user profile",
      description: "Create a new user profile entry",
      path: "/profiles",
      tags: ["UserProfile"],
    })
    .input(PostUserProfileSchema)
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("user_profiles")
        .where("user_id", "=", input.user_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A profile for this user already exists",
        });
      }

      const { metadata, ...rest } = input;

      const profile = await database
        .insertInto("user_profiles")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        } as Insertable<UserProfiles>)
        .returningAll()
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user profile",
        });
      }

      return profile;
    }),

  // 5. Mettre à jour un profil
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user profile",
      description: "Update an existing user profile by its ID",
      path: "/profiles/{profileId}",
      tags: ["UserProfile"],
    })
    .input(
      z
        .object({ profileId: z.string().uuid() })
        .merge(PutUserProfileSchema),
    )
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const { profileId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("user_profiles")
        .where("id", "=", profileId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      const profile = await database
        .updateTable("user_profiles")
        .set({
          ...rest,
          updated_at: new Date(),
          metadata: metadata as any,
        } as Insertable<UserProfiles>)
        .where("id", "=", profileId)
        .returningAll()
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update user profile",
        });
      }

      return profile;
    }),

  // 6. Supprimer un profil
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user profile",
      description: "Delete an existing user profile by its ID",
      path: "/profiles/{profileId}",
      tags: ["UserProfile"],
    })
    .input(DeleteUserProfileSchema)
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .deleteFrom("user_profiles")
        .where("id", "=", input.profileId)
        .returningAll()
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return profile;
    }),

  // 7. Supprimer plusieurs profils (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user profiles",
      description: "Delete multiple existing user profiles by their IDs",
      path: "/profiles",
      tags: ["UserProfile"],
    })
    .input(DeleteUserProfilesBulkSchema)
    .output(z.array(UserProfileSchema))
    .handler(async ({ input }) => {
      const { profileIds } = input;

      if (profileIds.length === 0) return [];

      return await database
        .deleteFrom("user_profiles")
        .where("id", "in", profileIds)
        .returningAll()
        .execute();
    }),
};
