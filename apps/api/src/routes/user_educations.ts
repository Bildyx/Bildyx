import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserEducationsSchema,
  GetUserEducationSchema,
  UserEducationSchema,
  PostUserEducationSchema,
  PutUserEducationSchema,
  DeleteUserEducationSchema,
  DeleteUserEducationsBulkSchema,
} from "../models/user_educations";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserEducations } from "../db/types";

export const user_educations = {
  // 1. Get all educations for a profile
  getEducationsByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all educations for a user profile",
      description: "Get all user educations for a specific profile",
      path: "/profiles/{userProfileId}/educations",
      tags: ["UserEducation"],
    })
    .input(GetUserEducationsSchema)
    .output(z.array(UserEducationSchema))
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
        .selectFrom("user_educations")
        .selectAll()
        .where("user_profile_id", "=", input.userProfileId)
        .orderBy("start_year", "desc")
        .execute();
    }),

  // 2. Get an education by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user education",
      description: "Get a specific user education entry by its unique ID",
      path: "/educations/{educationId}",
      tags: ["UserEducation"],
    })
    .input(GetUserEducationSchema)
    .output(UserEducationSchema)
    .handler(async ({ input }) => {
      const education = await database
        .selectFrom("user_educations")
        .selectAll()
        .where("id", "=", input.educationId)
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      return education;
    }),

  // 3. Create a new education
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user education",
      description: "Create a new user education entry",
      path: "/educations",
      tags: ["UserEducation"],
    })
    .input(PostUserEducationSchema)
    .output(UserEducationSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.user_profile_id)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      console.log(input);
      const education = await database
        .insertInto("user_educations")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserEducations>)
        .returningAll()
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user education",
        });
      }

      return education;
    }),

  // 4. Update an education
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user education",
      description: "Update an existing user education by its ID",
      path: "/educations/{educationId}",
      tags: ["UserEducation"],
    })
    .input(z.object({ educationId: z.uuid() }).merge(PutUserEducationSchema))
    .output(UserEducationSchema)
    .handler(async ({ input }) => {
      const { educationId, ...updates } = input;

      const education = await database
        .updateTable("user_educations")
        .set(updates as Insertable<UserEducations>)
        .where("id", "=", educationId)
        .returningAll()
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      return education;
    }),

  // 5. Supprimer une formation
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user education",
      description: "Delete an existing user education by its ID",
      path: "/educations/{educationId}",
      tags: ["UserEducation"],
    })
    .input(DeleteUserEducationSchema)
    .output(UserEducationSchema)
    .handler(async ({ input }) => {
      const education = await database
        .deleteFrom("user_educations")
        .where("id", "=", input.educationId)
        .returningAll()
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      return education;
    }),

  // 6. Supprimer plusieurs formations (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user educations",
      description: "Delete multiple user education entries by their IDs",
      path: "/educations",
      tags: ["UserEducation"],
    })
    .input(DeleteUserEducationsBulkSchema)
    .output(z.array(UserEducationSchema))
    .handler(async ({ input }) => {
      const { educationIds } = input;

      if (educationIds.length === 0) return [];

      return await database
        .deleteFrom("user_educations")
        .where("id", "in", educationIds)
        .returningAll()
        .execute();
    }),
};
