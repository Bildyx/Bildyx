import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  DeleteSubjectCategoriesBulkSchema,
  DeleteSubjectCategorySchema,
  GetSubjectCategoriesSchema,
  GetSubjectCategorySchema,
  PostSubjectCategorySchema,
  PutSubjectCategorySchema,
  SubjectCategorySchema,
} from "../models/subject_categories";

export const subject_categories = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all subject categories",
      description: "Get all subject categories with optional filters",
      path: "/subject-categories",
      tags: ["Subject Categories"],
    })
    .input(GetSubjectCategoriesSchema)
    .output(z.array(SubjectCategorySchema))
    .handler(async ({ input }) => {
      const { name, parent_id } = input;

      let query = database.selectFrom("subject_categories");

      if (name) {
        query = query.where("name", "ilike", `%${name.trim()}%`);
      }

      if (parent_id) {
        query = query.where("parent_id", "=", parent_id);
      }

      return await query.selectAll().execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one subject category",
      description: "Get a subject category by its ID",
      path: "/subject-categories/{subjectCategoryId}",
      tags: ["Subject Categories"],
    })
    .input(GetSubjectCategorySchema)
    .output(SubjectCategorySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("subject_categories")
        .where("id", "=", input.subjectCategoryId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Subject category not found",
        });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a subject category",
      description: "Create a new subject category",
      path: "/subject-categories",
      tags: ["Subject Categories"],
    })
    .input(PostSubjectCategorySchema)
    .output(SubjectCategorySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("subject_categories")
        .where("name", "ilike", input.name)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A subject category with this name already exists",
        });
      }

      const subjectCategory = await database
        .insertInto("subject_categories")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!subjectCategory) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create subject category",
        });
      }

      return subjectCategory;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a subject category",
      description: "Update an existing subject category by its ID",
      path: "/subject-categories/{subjectCategoryId}",
      tags: ["Subject Categories"],
    })
    .input(
      z.object({ subjectCategoryId: z.uuid() }).merge(PutSubjectCategorySchema),
    )
    .output(SubjectCategorySchema)
    .handler(async ({ input }) => {
      const { subjectCategoryId, ...rest } = input;

      const existing = await database
        .selectFrom("subject_categories")
        .where("id", "=", subjectCategoryId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Subject category not found",
        });
      }

      const subjectCategory = await database
        .updateTable("subject_categories")
        .set(rest)
        .where("id", "=", subjectCategoryId)
        .returningAll()
        .executeTakeFirst();

      if (!subjectCategory) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update subject category",
        });
      }

      return subjectCategory;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a subject category",
      description: "Soft delete a subject category by its ID",
      path: "/subject-categories/{subjectCategoryId}",
      tags: ["Subject Categories"],
    })
    .input(DeleteSubjectCategorySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("subject_categories")
        .where("id", "=", input.subjectCategoryId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Subject category not found",
        });
      }

      await database
        .deleteFrom("subject_categories")
        .where("id", "=", input.subjectCategoryId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple subject categories",
      description:
        "Soft delete multiple existing subject categories by their IDs",
      path: "/subject-categories",
      tags: ["Subject Categories"],
    })
    .input(DeleteSubjectCategoriesBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("subject_categories")
        .where("id", "in", input.subjectCategoryIds)
        .execute();
    }),
};
