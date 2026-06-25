import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { UniversitySchema, CreateUniversitySchema, UpdateUniversitySchema, GetUniversitiesSchema } from "../models/universities";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const universities = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all universities",
      description: "Get all universities with optional filters",
      path: "/universities",
      tags: ["University"]
    })
    .input(GetUniversitiesSchema)
    .output(z.array(UniversitySchema))
    .handler(async ({ input }) => {
      const { search, type, country_id, city_id } = input;

      let query = database.selectFrom('universities').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('name', 'ilike', p).or('official_name', 'ilike', p)
        );
      }

      if (type) query = query.where('type', '=', type);
      if (country_id) query = query.where('country_id', '=', country_id);
      if (city_id) query = query.where('city_id', '=', city_id);

      return await query
        .selectAll()
        .orderBy('name', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one university",
      description: "Get a university by its ID",
      path: "/universities/{universityId}",
      tags: ["University"]
    })
    .input(z.object({ universityId: z.string().uuid() }))
    .output(UniversitySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('universities')
        .where('id', '=', input.universityId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "University not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a university",
      description: "Create a new university",
      path: "/universities",
      tags: ["University"]
    })
    .input(CreateUniversitySchema)
    .output(UniversitySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('universities')
        .where('name', 'ilike', input.name)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A university with this name already exists" });
      }

      const { metadata, ...rest } = input;

      const university = await database
        .insertInto('universities')
        .values({
          ...rest,
          id: uuidv4(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!university) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create university" });
      }

      return university;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a university",
      description: "Update an existing university by its ID",
      path: "/universities/{universityId}",
      tags: ["University"]
    })
    .input(z.object({ universityId: z.string().uuid() }).merge(UpdateUniversitySchema))
    .output(UniversitySchema)
    .handler(async ({ input }) => {
      const { universityId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('universities')
        .where('id', '=', universityId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "University not found" });
      }

      const university = await database
        .updateTable('universities')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', universityId)
        .returningAll()
        .executeTakeFirst();

      if (!university) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update university" });
      }

      return university;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a university",
      description: "Soft delete a university by its ID",
      path: "/universities/{universityId}",
      tags: ["University"]
    })
    .input(z.object({ universityId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('universities')
        .where('id', '=', input.universityId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "University not found" });
      }

      await database
        .updateTable('universities')
        .set({ deleted_at: new Date() })
        .where('id', '=', input.universityId)
        .execute();

      return { success: true };
    }),
};