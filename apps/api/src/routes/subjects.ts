import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  SubjectSchema,
  PostSubjectSchema,
  PutSubjectSchema,
  GetSubjectsSchema,
  GetSubjectSchema,
  DeleteSubjectSchema,
  DeleteSubjectsBulkSchema,
} from "../models/subjects";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const subjects = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all subjects",
      description: "Get all subjects with optional filters",
      path: "/subjects",
      tags: ["Subject"],
    })
    .input(GetSubjectsSchema)
    .output(z.array(SubjectSchema))
    .handler(async ({ input }) => {
      const { name, organization_id, subject_category_id } = input;

      let query = database.selectFrom("subjects");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
      }

      if (subject_category_id) {
        query = query.where("subject_category_id", "=", subject_category_id);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one subject",
      description: "Get a subject by its ID",
      path: "/subjects/{subjectId}",
      tags: ["Subject"],
    })
    .input(GetSubjectSchema)
    .output(SubjectSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("subjects")
        .where("id", "=", input.subjectId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Subject not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a subject",
      description: "Create a new subject",
      path: "/subjects",
      tags: ["Subject"],
    })
    .input(PostSubjectSchema)
    .output(SubjectSchema)
    .handler(async ({ input }) => {
      let checkQuery = database
        .selectFrom("subjects")
        .where("name", "ilike", input.name);

      if (input.organization_id) {
        checkQuery = checkQuery.where(
          "organization_id",
          "=",
          input.organization_id,
        );
      } else {
        checkQuery = checkQuery.where("organization_id", "is", null);
      }

      const existing = await checkQuery.select("id").executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message:
            "A subject with this name already exists for this organization",
        });
      }

      try {
        const subject = await database
          .insertInto("subjects")
          .values({
            ...input,
            id: randomUUID(),
          })
          .returningAll()
          .executeTakeFirstOrThrow();

        return subject;
      } catch (error) {
        console.error("Database Insert Error:", error);

        if (error instanceof ORPCError) throw error;

        throw new ORPCError("BAD_REQUEST", {
          message:
            error instanceof Error ? error.message : "Failed to create subject",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a subject",
      description: "Update an existing subject by its ID",
      path: "/subjects/{subjectId}",
      tags: ["Subject"],
    })
    .input(z.object({ subjectId: z.uuid() }).merge(PutSubjectSchema))
    .output(SubjectSchema)
    .handler(async ({ input }) => {
      const { subjectId, ...rest } = input;

      const existing = await database
        .selectFrom("subjects")
        .where("id", "=", subjectId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Subject not found" });
      }

      const subject = await database
        .updateTable("subjects")
        .set(rest)
        .where("id", "=", subjectId)
        .returningAll()
        .executeTakeFirstOrThrow();

      return subject;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a subject",
      description: "Soft delete a subject by its ID",
      path: "/subjects/{subjectId}",
      tags: ["Subject"],
    })
    .input(DeleteSubjectSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("subjects")
        .where("id", "=", input.subjectId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Subject not found" });
      }

      await database
        .deleteFrom("subjects")
        .where("id", "=", input.subjectId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple subjects",
      description: "Soft delete multiple existing subjects by their IDs",
      path: "/subjects",
      tags: ["Subject"],
    })
    .input(DeleteSubjectsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("subjects")
        .where("id", "in", input.subjectIds)
        .execute();
    }),
};
