import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  DegreeSchema,
  CreateDegreeSchema,
  UpdateDegreeSchema,
  GetDegreesSchema,
} from "../models/degrees";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const degrees = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all degrees",
      description:
        "Get all degrees with optional search, level, university, and country filters",
      path: "/degrees",
      tags: ["Degree"],
    })
    .input(GetDegreesSchema)
    .output(z.array(DegreeSchema))
    .handler(async ({ input }) => {
      const { search, level, university_id, country_id } = input;

      let query = database.selectFrom("degrees");

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("field", "ilike", p),
        );
      }

      if (level) {
        query = query.where("level", "=", level);
      }

      if (university_id) {
        query = query.where("university_id", "=", university_id);
      }

      if (country_id) {
        query = query.where("country_id", "=", country_id);
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
    .input(z.object({ degreeId: z.string().uuid() }))
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
    .input(CreateDegreeSchema)
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      let checkQuery = database
        .selectFrom("degrees")
        .where("name", "ilike", input.name);

      if (input.university_id) {
        checkQuery = checkQuery.where(
          "university_id",
          "=",
          input.university_id,
        );
      } else {
        checkQuery = checkQuery.where("university_id", "is", null);
      }

      const existing = await checkQuery.select("id").executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A degree with this name already exists for this university",
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
      method: "PUT",
      summary: "Update a degree",
      description: "Update an existing degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"],
    })
    .input(z.object({ degreeId: z.string().uuid() }).merge(UpdateDegreeSchema))
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
    .input(z.object({ degreeId: z.string().uuid() }))
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
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("degrees")
        .where("id", "in", input.ids)
        .execute();
    }),
};
