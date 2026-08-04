import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  StudyFieldSchema,
  PostStudyFieldSchema,
  PutStudyFieldSchema,
  GetStudyFieldsSchema,
  GetStudyFieldSchema,
  DeleteStudyFieldSchema,
  DeleteStudyFieldsBulkSchema,
} from "../models/study_fields";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const studyFields = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all study fields",
      description: "Get all study fields with optional search and area filters",
      path: "/study-fields",
      tags: ["StudyField"],
    })
    .input(GetStudyFieldsSchema)
    .output(z.array(StudyFieldSchema))
    .handler(async ({ input }) => {
      const { name, area } = input;

      let query = database.selectFrom("StudyFields");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (area) {
        query = query.where("area", "ilike", `%${area.trim()}%`);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific study field",
      description: "Get a study field by its ID",
      path: "/study-fields/{studyFieldId}",
      tags: ["StudyField"],
    })
    .input(GetStudyFieldSchema)
    .output(StudyFieldSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("StudyFields")
        .where("id", "=", input.studyFieldId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Study field not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a study field",
      description: "Create a new study field",
      path: "/study-fields",
      tags: ["StudyField"],
    })
    .input(PostStudyFieldSchema)
    .output(StudyFieldSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("StudyFields")
        .where("name", "ilike", input.name)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A study field with this name already exists",
        });
      }

      const { metadata, ...rest } = input;

      const studyField = await database
        .insertInto("StudyFields")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!studyField) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create study field",
        });
      }

      return studyField;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a study field",
      description: "Update an existing study field by its ID",
      path: "/study-fields/{studyFieldId}",
      tags: ["StudyField"],
    })
    .input(z.object({ studyFieldId: z.string().uuid() }).merge(PutStudyFieldSchema))
    .output(StudyFieldSchema)
    .handler(async ({ input }) => {
      const { studyFieldId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("StudyFields")
        .where("id", "=", studyFieldId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Study field not found" });
      }

      const studyField = await database
        .updateTable("StudyFields")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", studyFieldId)
        .returningAll()
        .executeTakeFirst();

      if (!studyField) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update study field",
        });
      }

      return studyField;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a study field",
      description: "Delete an existing study field by its ID",
      path: "/study-fields/{studyFieldId}",
      tags: ["StudyField"],
    })
    .input(DeleteStudyFieldSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("StudyFields")
        .where("id", "=", input.studyFieldId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Study field not found" });
      }

      await database
        .deleteFrom("StudyFields")
        .where("id", "=", input.studyFieldId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple study fields",
      description: "Delete multiple existing study fields by their IDs",
      path: "/study-fields",
      tags: ["StudyField"],
    })
    .input(DeleteStudyFieldsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("StudyFields")
        .where("id", "in", input.studyFieldIds)
        .execute();
    }),
};
