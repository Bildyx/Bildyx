import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserExperiencesSchema,
  GetUserExperienceSchema,
  UserExperienceSchema,
  PostUserExperienceSchema,
  PutUserExperienceSchema,
  DeleteUserExperienceSchema,
  DeleteUserExperiencesBulkSchema,
} from "../models/user_experiences";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserExperiences } from "../db/types";

export const user_experiences = {
  // 1. Get all experiences of a profile
  getExperiencesByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all experiences for a user profile",
      description: "Get all experiences linked to a specific user profile",
      path: "/profiles/{userProfileId}/experiences",
      tags: ["UserExperience"],
    })
    .input(GetUserExperiencesSchema)
    .output(z.array(UserExperienceSchema))
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
        .selectFrom("user_experiences")
        .selectAll()
        .where("user_profile_id", "=", input.userProfileId)
        .orderBy("start_year", "desc")
        .execute();
    }),

  // 2. Get a user experience by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user experience",
      description: "Get a specific user experience by its unique ID",
      path: "/user-experiences/{userExperienceId}",
      tags: ["UserExperience"],
    })
    .input(GetUserExperienceSchema)
    .output(UserExperienceSchema)
    .handler(async ({ input }) => {
      const exp = await database
        .selectFrom("user_experiences")
        .selectAll()
        .where("id", "=", input.userExperienceId)
        .executeTakeFirst();

      if (!exp) {
        throw new ORPCError("NOT_FOUND", {
          message: "User experience not found",
        });
      }

      return exp;
    }),

  // 3. Add an experience to a profile
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add an experience to a user profile",
      description: "Link an experience to a specific user profile",
      path: "/user-experiences",
      tags: ["UserExperience"],
    })
    .input(PostUserExperienceSchema)
    .output(UserExperienceSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.user_profile_id)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      const exp = await database
        .insertInto("user_experiences")
        .values({
          id: randomUUID(),
          updated_at: new Date(),
          ...input,
        } as Insertable<UserExperiences>)
        .returningAll()
        .executeTakeFirst();

      if (!exp) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user experience",
        });
      }

      return exp;
    }),

  // 4. Update a user experience
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user experience",
      description: "Update details of an existing user experience by its ID",
      path: "/user-experiences/{userExperienceId}",
      tags: ["UserExperience"],
    })
    .input(
      z.object({ userExperienceId: z.uuid() }).merge(PutUserExperienceSchema),
    )
    .output(UserExperienceSchema)
    .handler(async ({ input }) => {
      const { userExperienceId, ...updates } = input;

      const exp = await database
        .updateTable("user_experiences")
        .set({
          ...updates,
          updated_at: new Date(),
        } as Insertable<UserExperiences>)
        .where("id", "=", userExperienceId)
        .returningAll()
        .executeTakeFirst();

      if (!exp) {
        throw new ORPCError("NOT_FOUND", {
          message: "User experience not found",
        });
      }

      return exp;
    }),

  // 5. Supprimer une experience utilisateur
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user experience",
      description: "Delete an existing user experience by its ID",
      path: "/user-experiences/{userExperienceId}",
      tags: ["UserExperience"],
    })
    .input(DeleteUserExperienceSchema)
    .output(UserExperienceSchema)
    .handler(async ({ input }) => {
      const exp = await database
        .deleteFrom("user_experiences")
        .where("id", "=", input.userExperienceId)
        .returningAll()
        .executeTakeFirst();

      if (!exp) {
        throw new ORPCError("NOT_FOUND", {
          message: "User experience not found",
        });
      }

      return exp;
    }),

  // 6. Supprimer plusieurs experiences utilisateur (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user experiences",
      description: "Delete multiple user experiences by their IDs",
      path: "/user-experiences",
      tags: ["UserExperience"],
    })
    .input(DeleteUserExperiencesBulkSchema)
    .output(z.array(UserExperienceSchema))
    .handler(async ({ input }) => {
      const { userExperienceIds } = input;

      if (userExperienceIds.length === 0) return [];

      return await database
        .deleteFrom("user_experiences")
        .where("id", "in", userExperienceIds)
        .returningAll()
        .execute();
    }),
};
