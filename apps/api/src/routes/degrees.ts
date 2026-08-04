import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  DegreeSchema,
  PostDegreeSchema,
  PutDegreeSchema,
  GetDegreesSchema,
  GetDegreeSchema,
  DeleteDegreeSchema,
  DeleteDegreesBulkSchema,
} from "../models/degrees";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const degrees = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all degrees",
      description: "Get all degrees with optional search and level filters",
      path: "/degrees",
      tags: ["Degree"],
    })
    .input(GetDegreesSchema)
    .output(z.array(DegreeSchema))
    .handler(async ({ input }) => {
      const { name, level } = input;

      let query = database.selectFrom("degrees");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("area", "ilike", p),
        );
      }

      if (level) {
        query = query.where("level", "=", level);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific degree",
      description: "Get a degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"],
    })
    .input(GetDegreeSchema)
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("degrees")
        .where("id", "=", input.degreeId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Degree not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a degree",
      description: "Create a new degree",
      path: "/degrees",
      tags: ["Degree"],
    })
    .input(PostDegreeSchema)
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("degrees")
        .where("name", "ilike", input.name)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A degree with this name already exists",
        });
      }

      const { metadata, ...rest } = input;

      const degree = await database
        .insertInto("degrees")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!degree) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create degree",
        });
      }

      return degree;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a degree",
      description: "Update an existing degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"],
    })
    .input(z.object({ degreeId: z.uuid() }).merge(PutDegreeSchema))
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const { degreeId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("degrees")
        .where("id", "=", degreeId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Degree not found" });
      }

      const degree = await database
        .updateTable("degrees")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", degreeId)
        .returningAll()
        .executeTakeFirst();

      if (!degree) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update degree",
        });
      }

      return degree;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a degree",
      description: "Delete an existing degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"],
    })
    .input(DeleteDegreeSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("degrees")
        .where("id", "=", input.degreeId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Degree not found" });
      }

      await database
        .deleteFrom("degrees")
        .where("id", "=", input.degreeId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple degrees",
      description: "Delete multiple existing degrees by their IDs",
      path: "/degrees",
      tags: ["Degree"],
    })
    .input(DeleteDegreesBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("degrees")
        .where("id", "in", input.degreeIds)
        .execute();
    }),
};
