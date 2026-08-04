import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserEducationFieldsSchema,
  GetUserEducationFieldSchema,
  UserEducationFieldSchema,
  PostUserEducationFieldSchema,
  PutUserEducationFieldSchema,
  DeleteUserEducationFieldSchema,
  DeleteUserEducationFieldsBulkSchema,
} from "../models/user_education_fields";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserEducationFields } from "../db/types";

export const user_education_fields = {
  // 1. Get all fields for an education
  getByEducation: publicProcedure
    .route({
      method: "GET",
      summary: "List all fields for a user education",
      description:
        "Get all study fields linked to a specific user education entry",
      path: "/educations/{userEducationId}/fields",
      tags: ["UserEducationField"],
    })
    .input(GetUserEducationFieldsSchema)
    .output(z.array(UserEducationFieldSchema))
    .handler(async ({ input }) => {
      const education = await database
        .selectFrom("user_educations")
        .where("id", "=", input.userEducationId)
        .select("id")
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      return await database
        .selectFrom("user_education_fields")
        .selectAll()
        .where("user_education_id", "=", input.userEducationId)
        .execute();
    }),

  // 2. Get a field by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user education field",
      description: "Get a specific user education field by its unique ID",
      path: "/education-fields/{fieldId}",
      tags: ["UserEducationField"],
    })
    .input(GetUserEducationFieldSchema)
    .output(UserEducationFieldSchema)
    .handler(async ({ input }) => {
      const field = await database
        .selectFrom("user_education_fields")
        .selectAll()
        .where("id", "=", input.fieldId)
        .executeTakeFirst();

      if (!field) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education field not found",
        });
      }

      return field;
    }),

  // 3. Create a new education field
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new user education field",
      description: "Link a study field to a user education entry",
      path: "/education-fields",
      tags: ["UserEducationField"],
    })
    .input(PostUserEducationFieldSchema)
    .output(UserEducationFieldSchema)
    .handler(async ({ input }) => {
      const education = await database
        .selectFrom("user_educations")
        .where("id", "=", input.user_education_id)
        .select("id")
        .executeTakeFirst();

      if (!education) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education not found",
        });
      }

      const existing = await database
        .selectFrom("user_education_fields")
        .where("user_education_id", "=", input.user_education_id)
        .where("study_field_Id", "=", input.study_field_Id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This study field is already linked to this education entry",
        });
      }

      const field = await database
        .insertInto("user_education_fields")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserEducationFields>)
        .returningAll()
        .executeTakeFirst();

      if (!field) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user education field",
        });
      }

      return field;
    }),

  // 4. Update an education field
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user education field",
      description: "Update an existing user education field by its ID",
      path: "/education-fields/{fieldId}",
      tags: ["UserEducationField"],
    })
    .input(z.object({ fieldId: z.uuid() }).merge(PutUserEducationFieldSchema))
    .output(UserEducationFieldSchema)
    .handler(async ({ input }) => {
      const { fieldId, ...updates } = input;

      const field = await database
        .updateTable("user_education_fields")
        .set(updates as Insertable<UserEducationFields>)
        .where("id", "=", fieldId)
        .returningAll()
        .executeTakeFirst();

      if (!field) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education field not found",
        });
      }

      return field;
    }),

  // 5. Supprimer un champ de formation
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user education field",
      description: "Delete an existing user education field by its ID",
      path: "/education-fields/{fieldId}",
      tags: ["UserEducationField"],
    })
    .input(DeleteUserEducationFieldSchema)
    .output(UserEducationFieldSchema)
    .handler(async ({ input }) => {
      const field = await database
        .deleteFrom("user_education_fields")
        .where("id", "=", input.fieldId)
        .returningAll()
        .executeTakeFirst();

      if (!field) {
        throw new ORPCError("NOT_FOUND", {
          message: "User education field not found",
        });
      }

      return field;
    }),

  // 6. Supprimer plusieurs champs (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user education fields",
      description: "Delete multiple user education fields by their IDs",
      path: "/education-fields",
      tags: ["UserEducationField"],
    })
    .input(DeleteUserEducationFieldsBulkSchema)
    .output(z.array(UserEducationFieldSchema))
    .handler(async ({ input }) => {
      const { fieldIds } = input;

      if (fieldIds.length === 0) return [];

      return await database
        .deleteFrom("user_education_fields")
        .where("id", "in", fieldIds)
        .returningAll()
        .execute();
    }),
};
