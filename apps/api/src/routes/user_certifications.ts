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
  // 1. Récupérer toutes les certifications d'un profil
  getByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all certifications for a user profile",
      description: "Get all certifications linked to a specific user profile",
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
        .orderBy("obtained_at", "desc")
        .execute();
    }),

  // 2. Récupérer une certification utilisateur par son ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user certification",
      description: "Get a specific user certification by its unique ID",
      path: "/user-certifications/{userCertificationId}",
      tags: ["UserCertification"],
    })
    .input(GetUserCertificationSchema)
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const cert = await database
        .selectFrom("user_certifications")
        .selectAll()
        .where("id", "=", input.userCertificationId)
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "User certification not found",
        });
      }

      return cert;
    }),

  // 3. Ajouter une certification à un profil
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add a certification to a user profile",
      description: "Link a certification to a specific user profile",
      path: "/user-certifications",
      tags: ["UserCertification"],
    })
    .input(PostUserCertificationSchema)
    .output(UserCertificationSchema)
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
        .selectFrom("user_certifications")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("certification_id", "=", input.certification_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This certification is already linked to this profile",
        });
      }

      const cert = await database
        .insertInto("user_certifications")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserCertifications>)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user certification",
        });
      }

      return cert;
    }),

  // 4. Mettre à jour une certification utilisateur
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user certification",
      description: "Update dates of an existing user certification by its ID",
      path: "/user-certifications/{userCertificationId}",
      tags: ["UserCertification"],
    })
    .input(
      z
        .object({ userCertificationId: z.string().uuid() })
        .merge(PutUserCertificationSchema),
    )
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const { userCertificationId, ...updates } = input;

      const cert = await database
        .updateTable("user_certifications")
        .set(updates as Insertable<UserCertifications>)
        .where("id", "=", userCertificationId)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "User certification not found",
        });
      }

      return cert;
    }),

  // 5. Supprimer une certification utilisateur
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user certification",
      description: "Delete an existing user certification by its ID",
      path: "/user-certifications/{userCertificationId}",
      tags: ["UserCertification"],
    })
    .input(DeleteUserCertificationSchema)
    .output(UserCertificationSchema)
    .handler(async ({ input }) => {
      const cert = await database
        .deleteFrom("user_certifications")
        .where("id", "=", input.userCertificationId)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "User certification not found",
        });
      }

      return cert;
    }),

  // 6. Supprimer plusieurs certifications utilisateur (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user certifications",
      description: "Delete multiple user certifications by their IDs",
      path: "/user-certifications",
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
