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
      const { name, category, organization_id } = input;

      let query = database
        .selectFrom("subjects")
        .where("deleted_at", "is", null);

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (category) {
        query = query.where("category", "=", category);
      }
      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
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
        .where("deleted_at", "is", null)
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
        .where("name", "ilike", input.name)
        .where("deleted_at", "is", null);

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

      const { metadata, ...rest } = input;

      const subject = await database
        .insertInto("subjects")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!subject) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create subject",
        });
      }

      return subject;
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
      const { subjectId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("subjects")
        .where("id", "=", subjectId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Subject not found" });
      }

      const subject = await database
        .updateTable("subjects")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", subjectId)
        .returningAll()
        .executeTakeFirst();

      if (!subject) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update subject",
        });
      }

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
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Subject not found" });
      }

      await database
        .updateTable("subjects")
        .set({ deleted_at: new Date() })
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
        .updateTable("subjects")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.subjectIds)
        .execute();
    }),
};
