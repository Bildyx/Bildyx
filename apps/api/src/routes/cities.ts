import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { CitySchema, CreateCitySchema, UpdateCitySchema, GetCitiesSchema } from "../models/cities";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const cities = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all cities",
      description: "Get all cities with optional filters",
      path: "/cities",
      tags: ["City"]
    })
    .input(GetCitiesSchema)
    .output(z.array(CitySchema))
    .handler(async ({ input }) => {
      const { search, country_id } = input;

      let query = database.selectFrom('cities').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where('name', 'ilike', p);
      }

      if (country_id) query = query.where('country_id', '=', country_id);

      return await query.selectAll().orderBy('name', 'asc').execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one city",
      description: "Get a city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"]
    })
    .input(z.object({ cityId: z.string().uuid() }))
    .output(CitySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('cities')
        .where('id', '=', input.cityId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) throw new ORPCError("NOT_FOUND", { message: "City not found" });

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a city",
      description: "Create a new city",
      path: "/cities",
      tags: ["City"]
    })
    .input(CreateCitySchema)
    .output(CitySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('cities')
        .where('name', 'ilike', input.name)
        .where('country_id', '=', input.country_id)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) throw new ORPCError("CONFLICT", { message: "A city with this name already exists in this country" });

      const { metadata, ...rest } = input;

      const city = await database
        .insertInto('cities')
        .values({ ...rest, id: uuidv4(), updated_at: new Date(), metadata: metadata as any })
        .returningAll()
        .executeTakeFirst();

      if (!city) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create city" });

      return city;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a city",
      description: "Update an existing city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"]
    })
    .input(z.object({ cityId: z.string().uuid() }).merge(UpdateCitySchema))
    .output(CitySchema)
    .handler(async ({ input }) => {
      const { cityId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('cities')
        .where('id', '=', cityId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) throw new ORPCError("NOT_FOUND", { message: "City not found" });

      const city = await database
        .updateTable('cities')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', cityId)
        .returningAll()
        .executeTakeFirst();

      if (!city) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update city" });

      return city;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a city",
      description: "Soft delete a city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"]
    })
    .input(z.object({ cityId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('cities')
        .where('id', '=', input.cityId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) throw new ORPCError("NOT_FOUND", { message: "City not found" });

      await database.updateTable('cities').set({ deleted_at: new Date() }).where('id', '=', input.cityId).execute();

      return { success: true };
    }),
};