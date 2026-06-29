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
      description: "Get all cities with optional search and country filter",
      path: "/cities",
      tags: ["City"]
    })
    .input(GetCitiesSchema)
    .output(z.array(CitySchema))
    .handler(async ({ input }) => {
      const { search, country_id } = input;

      let query = database.selectFrom('cities');

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where('city_name', 'ilike', p);
      }

      if (country_id) {
        query = query.where('country_id', '=', country_id);
      }

      return await query
        .selectAll()
        .orderBy('city_name', 'asc')
        .execute();
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
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "City not found" });
      }

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
        .where('city_name', 'ilike', input.city_name)
        .$if(!!input.country_id, (qb) => qb.where('country_id', '=', input.country_id!))
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A city with this name already exists in this country" });
      }

      const city = await database
        .insertInto('cities')
        .values({
          ...input,
          id: uuidv4(),
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!city) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create city" });
      }

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
      const { cityId, ...data } = input;

      const existing = await database
        .selectFrom('cities')
        .where('id', '=', cityId)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "City not found" });
      }

      const city = await database
        .updateTable('cities')
        .set({ ...data, updated_at: new Date() })
        .where('id', '=', cityId)
        .returningAll()
        .executeTakeFirst();

      if (!city) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update city" });
      }

      return city;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a city",
      description: "Delete a city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"]
    })
    .input(z.object({ cityId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('cities')
        .where('id', '=', input.cityId)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "City not found" });
      }

      await database
        .deleteFrom('cities')
        .where('id', '=', input.cityId)
        .execute();

      return { success: true };
    }),
};