import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  CitySchema,
  PostCitySchema,
  PutCitySchema,
  GetCitiesSchema,
  GetCitySchema,
  DeleteCitySchema,
  DeleteCitiesBulkSchema,
  CityListItemSchema,
} from "../models/cities";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const cities = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all cities",
      description: "Get all cities with optional filters",
      path: "/cities",
      tags: ["City"],
    })
    .input(GetCitiesSchema)
    .output(z.array(CityListItemSchema))
    .handler(async ({ input }) => {
      const { name, country_id } = input;

      let query = database
        .selectFrom("cities")
        .innerJoin("countries", "countries.iso_code", "cities.country_id");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where("cities.name", "ilike", p);
      }

      if (country_id) {
        query = query.where("country_id", "=", country_id);
      }

      return await query
        .select("cities.id")
        .select("cities.name")
        .select("countries.name as country_name")
        .orderBy("name", "asc")
        .execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific city",
      description: "Get a city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"],
    })
    .input(GetCitySchema)
    .output(CitySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("cities")
        .where("id", "=", input.cityId)
        .selectAll()
        .executeTakeFirst();

      if (!data)
        throw new ORPCError("NOT_FOUND", { message: "City not found" });

      return data;
    }),

  getCitiesForCountry: publicProcedure
    .route({
      method: "GET",
      summary: "List all cities for a specific country",
      description: "Get all cities for a country by its ID",
      path: "/countries/{countryId}/cities",
      tags: ["Country"],
    })
    .input(z.object({ countryId: z.string().length(2) }))
    .output(z.array(CitySchema))
    .handler(async ({ input }) => {
      const cities = await database
        .selectFrom("cities")
        .where("country_id", "=", input.countryId)
        .selectAll()
        .execute();

      return cities;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a city",
      description: "Create a new city",
      path: "/cities",
      tags: ["City"],
    })
    .input(PostCitySchema)
    .output(CitySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("cities")
        .where("name", "ilike", input.name)
        .where("country_id", "=", input.country_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A city with this name already exists in this country",
        });
      }

      const existingCountry = await database
        .selectFrom("countries")
        .where("iso_code", "=", input.country_id)
        .select("iso_code")
        .executeTakeFirst();

      if (!existingCountry) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      const city = await database
        .insertInto("cities")
        .values({
          ...input,
          id: randomUUID(),
        } as any)
        .returningAll()
        .executeTakeFirst();

      if (!city) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create city",
        });
      }

      return city;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a city",
      description: "Update an existing city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"],
    })
    .input(z.object({ cityId: z.uuid() }).merge(PutCitySchema))
    .output(CitySchema)
    .handler(async ({ input }) => {
      const { cityId, ...data } = input;

      const existing = await database
        .selectFrom("cities")
        .where("id", "=", cityId)
        .select("id")
        .executeTakeFirst();

      if (!existing)
        throw new ORPCError("NOT_FOUND", { message: "City not found" });

      const city = await database
        .updateTable("cities")
        .set({ ...data, updated_at: new Date() } as any)
        .where("id", "=", cityId)
        .returningAll()
        .executeTakeFirst();

      if (!city) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update city",
        });
      }

      return city;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a city",
      description: "Soft delete a city by its ID",
      path: "/cities/{cityId}",
      tags: ["City"],
    })
    .input(DeleteCitySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("cities")
        .where("id", "=", input.cityId)
        .select("id")
        .executeTakeFirst();

      if (!existing)
        throw new ORPCError("NOT_FOUND", { message: "City not found" });

      await database
        .deleteFrom("cities")
        .where("id", "=", input.cityId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple cities",
      description: "Delete multiple existing cities by their IDs",
      path: "/cities",
      tags: ["City"],
    })
    .input(DeleteCitiesBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("cities")
        .where("id", "in", input.cityIds)
        .execute();
    }),
};
