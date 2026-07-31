import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserLanguagesSchema,
  GetUserLanguageSchema,
  UserLanguageSchema,
  PostUserLanguageSchema,
  PutUserLanguageSchema,
  DeleteUserLanguageSchema,
  DeleteUserLanguagesBulkSchema,
} from "../models/user_languages";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserLanguages } from "../db/types";

export const user_languages = {
  // 1. Get all languages of a profile
  getLanguagesByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all languages for a user profile",
      description: "Get all languages linked to a specific user profile",
      path: "/profiles/{userProfileId}/languages",
      tags: ["UserLanguage"],
    })
    .input(GetUserLanguagesSchema)
    .output(z.array(UserLanguageSchema))
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.userProfileId)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return await database
        .selectFrom("user_languages")
        .selectAll()
        .where("user_profile_id", "=", input.userProfileId)
        .execute();
    }),

  // 2. Get a user language by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user language",
      description: "Get a specific user language by its unique ID",
      path: "/user-languages/{userLanguageId}",
      tags: ["UserLanguage"],
    })
    .input(GetUserLanguageSchema)
    .output(UserLanguageSchema)
    .handler(async ({ input }) => {
      const lang = await database
        .selectFrom("user_languages")
        .selectAll()
        .where("id", "=", input.userLanguageId)
        .executeTakeFirst();

      if (!lang) {
        throw new ORPCError("NOT_FOUND", {
          message: "User language not found",
        });
      }

      return lang;
    }),

  // 3. Add a language to a profile
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add a language to a user profile",
      description: "Link a language to a specific user profile",
      path: "/user-languages",
      tags: ["UserLanguage"],
    })
    .input(PostUserLanguageSchema)
    .output(UserLanguageSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.user_profile_id)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      const existing = await database
        .selectFrom("user_languages")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("language", "=", input.language)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This language is already linked to this profile",
        });
      }

      const lang = await database
        .insertInto("user_languages")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserLanguages>)
        .returningAll()
        .executeTakeFirst();

      if (!lang) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user language",
        });
      }

      return lang;
    }),

  // 4. Update a user language
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user language",
      description: "Update level of an existing user language by its ID",
      path: "/user-languages/{userLanguageId}",
      tags: ["UserLanguage"],
    })
    .input(
      z
        .object({ userLanguageId: z.string().uuid() })
        .merge(PutUserLanguageSchema),
    )
    .output(UserLanguageSchema)
    .handler(async ({ input }) => {
      const { userLanguageId, ...updates } = input;

      const lang = await database
        .updateTable("user_languages")
        .set(updates as Insertable<UserLanguages>)
        .where("id", "=", userLanguageId)
        .returningAll()
        .executeTakeFirst();

      if (!lang) {
        throw new ORPCError("NOT_FOUND", {
          message: "User language not found",
        });
      }

      return lang;
    }),

  // 5. Supprimer une langue utilisateur
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user language",
      description: "Delete an existing user language by its ID",
      path: "/user-languages/{userLanguageId}",
      tags: ["UserLanguage"],
    })
    .input(DeleteUserLanguageSchema)
    .output(UserLanguageSchema)
    .handler(async ({ input }) => {
      const lang = await database
        .deleteFrom("user_languages")
        .where("id", "=", input.userLanguageId)
        .returningAll()
        .executeTakeFirst();

      if (!lang) {
        throw new ORPCError("NOT_FOUND", {
          message: "User language not found",
        });
      }

      return lang;
    }),

  // 6. Supprimer plusieurs langues utilisateur (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user languages",
      description: "Delete multiple user languages by their IDs",
      path: "/user-languages",
      tags: ["UserLanguage"],
    })
    .input(DeleteUserLanguagesBulkSchema)
    .output(z.array(UserLanguageSchema))
    .handler(async ({ input }) => {
      const { userLanguageIds } = input;

      if (userLanguageIds.length === 0) return [];

      return await database
        .deleteFrom("user_languages")
        .where("id", "in", userLanguageIds)
        .returningAll()
        .execute();
    }),
};
