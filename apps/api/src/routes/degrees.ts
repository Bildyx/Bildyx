import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { DegreeSchema, CreateDegreeSchema, UpdateDegreeSchema, GetDegreesSchema } from "../models/degrees";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const degrees = {
  getAll: publicProcedure 
    .route({
      method: "GET",
      summary: "List all degrees",
      description: "Get all degrees with optional filters",
      path: "/degrees",
      tags: ["Degree"]
    })
    .input(GetDegreesSchema)
    .output(z.array(DegreeSchema))
    .handler(async ({ input }) => {
      const { search, level, university_id, country_id } = input;

      let query = database.selectFrom('degrees').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('name', 'ilike', p).or('field', 'ilike', p)
        );
      }

      if (level) {
        query = query.where('level', '=', level);
      }

      if (university_id) {
        query = query.where('university_id', '=', university_id);
      }

      if (country_id) {
        query = query.where('country_id', '=', country_id);
      }

      return await query
        .selectAll()
        .orderBy('name', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one degree",
      description: "Get a degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"]
    })
    .input(z.object({ degreeId: z.string().uuid() }))
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('degrees')
        .where('id', '=', input.degreeId)
        .where('deleted_at', 'is', null)
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
      tags: ["Degree"]
    })
    .input(CreateDegreeSchema)
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('degrees')
        .where('name', 'ilike', input.name)
        .$if(!!input.university_id, (qb) => qb.where('university_id', '=', input.university_id!))
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A degree with this name already exists for this university" });
      }

      const { metadata, ...rest } = input;

      const degree = await database
        .insertInto('degrees')
        .values({
          ...rest,
          id: uuidv4(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!degree) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create degree" });
      }

      return degree;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a degree",
      description: "Update an existing degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"]
    })
    .input(z.object({ degreeId: z.string().uuid() }).merge(UpdateDegreeSchema))
    .output(DegreeSchema)
    .handler(async ({ input }) => {
      const { degreeId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('degrees')
        .where('id', '=', degreeId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Degree not found" });
      }

      const degree = await database
        .updateTable('degrees')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', degreeId)
        .returningAll()
        .executeTakeFirst();

      if (!degree) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update degree" });
      }

      return degree;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Soft delete a degree",
      description: "Soft delete a degree by its ID",
      path: "/degrees/{degreeId}",
      tags: ["Degree"]
    })
    .input(z.object({ degreeId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('degrees')
        .where('id', '=', input.degreeId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Degree not found" });
      }

      await database
        .updateTable('degrees')
        .set({ deleted_at: new Date() })
        .where('id', '=', input.degreeId)
        .execute();

      return { success: true };
    }),
};