import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserCertificationsSchema,
  GetUserCertificationSchema,
  UserCertificationSchema,
  PostUserCertificationSchema,
  PutUserCertificationSchema,
  DeleteUserCertificationSchema,
  DeleteUserCertificationsBulkSchema,
} from "../models/user_certifications";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserCertifications } from "../db/types";

export const user_certifications = {
  // 1. Get all certifications for a profile
  getCertificationsByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all certifications for a user profile",
      description: "Get all user certifications for a specific profile",
      path: "/profiles/{userProfileId}/certifications",
      tags: ["UserCertification"],
    })
    .input(GetUserCertificationsSchema)
    .output(z.array(UserCertificationSchema))
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
        .selectFrom("user_certifications")
        .selectAll()
        .where("user_profile_id", "=", input.userProfileId)
        .execute();
    }),

  // 2. Get a certification by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user certification",
      description: "Get a specific user certification entry by its unique ID",
      path: "/certifications/{certificationId}",
      tags: ["UserCertification"],
    })
    .input(GetUserCertificationSchema)
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const education = await database
        .selectFrom("user_certifications")
        .selectAll()
        .where("id", "=", input.userCertificationId)
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      return education;
    }),

  // 3. Create a new certification
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user certification",
      description: "Create a new user certification entry",
      path: "/certifications",
      tags: ["UserCertification"],
    })
    .input(PostUserCertificationSchema)
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      try {
        const profile = await database
          .selectFrom("user_profiles")
          .where("id", "=", input.user_profile_id)
          .select("id")
          .executeTakeFirst();

        if (!profile) {
          throw new ORPCError("NOT_FOUND", {
            message: "User profile not found",
          });
        }

        const education = await database
          .insertInto("user_certifications")
          .values({
            id: randomUUID(),
            ...input,
          } as Insertable<UserCertifications>)
          .returningAll()
          .executeTakeFirst();

        if (!education) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to create user education",
          });
        }

        return education;
      } catch (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user education : " + error,
        });
      }
    }),

  // 4. Update a certification
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user certification",
      description: "Update an existing user certification by its ID",
      path: "/certifications/{userCertificationId}",
      tags: ["UserCertification"],
    })
    .input(
      z
        .object({ userCertificationId: z.uuid() })
        .merge(PutUserCertificationSchema),
    )
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const { userCertificationId, ...updates } = input;

      const certification = await database
        .updateTable("user_certifications")
        .set(updates as Insertable<UserCertifications>)
        .where("id", "=", userCertificationId)
        .returningAll()
        .executeTakeFirst();

      if (!certification) {
        throw new ORPCError("NOT_FOUND", {
          message: "User certification not found",
        });
      }

      return certification;
    }),

  // 5. Supprimer une certification
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user certification",
      description: "Delete an existing user certification by its ID",
      path: "/certifications/{userCertificationId}",
      tags: ["UserCertification"],
    })
    .input(DeleteUserCertificationSchema)
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const certification = await database
        .deleteFrom("user_certifications")
        .where("id", "=", input.userCertificationId)
        .returningAll()
        .executeTakeFirst();

      if (!certification) {
        throw new ORPCError("NOT_FOUND", {
          message: "User certification not found",
        });
      }

      return certification;
    }),

  // 6. Supprimer plusieurs certifications (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user certifications",
      description: "Delete multiple user certification entries by their IDs",
      path: "/certifications",
      tags: ["UserCertification"],
    })
    .input(DeleteUserCertificationsBulkSchema)
    .output(z.array(UserCertificationSchema))
    .handler(async ({ input }) => {
      const { userCertificationIds } = input;

      if (userCertificationIds.length === 0) return [];

      return await database
        .deleteFrom("user_certifications")
        .where("id", "in", userCertificationIds)
        .returningAll()
        .execute();
    }),
};
