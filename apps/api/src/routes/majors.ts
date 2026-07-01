import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  MajorSchema,
  PostMajorSchema,
  PutMajorSchema,
  GetMajorsSchema,
  GetMajorSchema,
  DeleteMajorSchema,
  DeleteMajorsBulkSchema,
} from "../models/majors";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const majors = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all majors",
      description: "Get all majors with optional filters",
      path: "/majors",
      tags: ["Major"],
    })
    .input(GetMajorsSchema)
    .output(z.array(MajorSchema))
    .handler(async ({ input }) => {
      const { name, area } = input;

      let query = database
        .selectFrom("majors")
        .where("deleted_at", "is", null);

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (area) {
        query = query.where("area", "=", area);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one major",
      description: "Get a major by its ID",
      path: "/majors/{majorId}",
      tags: ["Major"],
    })
    .input(GetMajorSchema)
    .output(MajorSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("majors")
        .where("id", "=", input.majorId)
        .where("deleted_at", "is", null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Major not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a major",
      description: "Create a new major",
      path: "/majors",
      tags: ["Major"],
    })
    .input(PostMajorSchema)
    .output(MajorSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("majors")
        .where("name", "ilike", input.name)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A major with this name already exists",
        });
      }

      const { metadata, ...rest } = input;

      const major = await database
        .insertInto("majors")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!major) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create major",
        });
      }

      return major;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a major",
      description: "Update an existing major by its ID",
      path: "/majors/{majorId}",
      tags: ["Major"],
    })
    .input(z.object({ majorId: z.string().uuid() }).merge(PutMajorSchema))
    .output(MajorSchema)
    .handler(async ({ input }) => {
      const { majorId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("majors")
        .where("id", "=", majorId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Major not found" });
      }

      const major = await database
        .updateTable("majors")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", majorId)
        .returningAll()
        .executeTakeFirst();

      if (!major) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update major",
        });
      }

      return major;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a major",
      description: "Soft delete a major by its ID",
      path: "/majors/{majorId}",
      tags: ["Major"],
    })
    .input(DeleteMajorSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("majors")
        .where("id", "=", input.majorId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Major not found" });
      }

      await database
        .updateTable("majors")
        .set({ deleted_at: new Date() })
        .where("id", "=", input.majorId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple majors",
      description: "Soft delete multiple existing majors by their IDs",
      path: "/majors",
      tags: ["Major"],
    })
    .input(DeleteMajorsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .updateTable("majors")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.majorIds)
        .execute();
    }),
};
