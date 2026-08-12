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
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const user_profiles = {
  // 1. Get all profiles
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
      const { userId, countryId, cityId, excludeOrganizations } = input;

      let query = database.selectFrom("user_profiles") as any;

      if (excludeOrganizations) {
        query = query
          .innerJoin("users", "users.id", "user_profiles.user_id")
          .where("users.role", "!=", "ORGANIZATION")
          .selectAll("user_profiles");
      } else {
        query = query.selectAll();
      }

      if (userId) {
        query = query.where("user_profiles.user_id", "=", userId);
      }

      if (countryId) {
        query = query.where("user_profiles.country_id", "=", countryId);
      }

      if (cityId) {
        query = query.where("user_profiles.city_id", "=", cityId);
      }

      return await query.execute();
    }),

  // 2. Get a profile by ID
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

  // 3. Get a user's profile by userId
  getFullProfileByUser: publicProcedure
    .route({
      method: "GET",
      summary: "Get full user profile with all relations ",
      path: "/users/{userId}/full-profile",
      tags: ["UserProfile"],
    })
    .input(GetUserProfileByUserSchema)
    .handler(async ({ input }) => {
      const fullProfile = await database
        .selectFrom("user_profiles as p")
        .selectAll("p")
        .select((eb) => [
          // Jointure JSON pour les langues
          jsonArrayFrom(
            eb
              .selectFrom("user_languages as l")
              .selectAll("l")
              .whereRef("l.user_profile_id", "=", "p.id"),
          ).as("languages"),

          // Jointure JSON pour les compétences
          jsonArrayFrom(
            eb
              .selectFrom("user_skills as s")
              .innerJoin("skills as sk", "sk.id", "s.skill_id")
              .select([
                "s.id as id",
                "s.user_profile_id as user_profile_id",
                "s.skill_id as skill_id",
                "s.level as level",
                "sk.name as name",
              ])
              .whereRef("s.user_profile_id", "=", "p.id"),
          ).as("skills"),

          // Jointure JSON pour les expériences
          jsonArrayFrom(
            eb
              .selectFrom("user_experiences as ex")
              .selectAll("ex")
              .whereRef("ex.user_profile_id", "=", "p.id"),
          ).as("experiences"),

          // Jointure JSON pour les diplômes / formations
          jsonArrayFrom(
            eb
              .selectFrom("user_educations as ed")
              .selectAll("ed")
              .whereRef("ed.user_profile_id", "=", "p.id"),
          ).as("educations"),

          // Jointure JSON pour les certifications
          jsonArrayFrom(
            eb
              .selectFrom("user_certifications as c")
              .selectAll("c")
              .whereRef("c.user_profile_id", "=", "p.id"),
          ).as("certifications"),
        ])
        .where("p.user_id", "=", input.userId)
        .executeTakeFirst();

      if (!fullProfile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return fullProfile;
    }),

  // 4. Create a new profile
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

      const { ...rest } = input;

      const profile = await database
        .insertInto("user_profiles")
        .values({
          ...rest,
          id: randomUUID(),
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

  // 5. Update a profile
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user profile",
      description: "Update an existing user profile by its ID",
      path: "/profiles/{profileId}",
      tags: ["UserProfile"],
    })
    .input(z.object({ profileId: z.uuid() }).merge(PutUserProfileSchema))
    .output(UserProfileSchema)
    .handler(async ({ input }) => {
      const { profileId, ...rest } = input;

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
        })
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
