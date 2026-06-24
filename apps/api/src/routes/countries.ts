import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { CountrySchema, CreateCountrySchema, UpdateCountrySchema, GetCountriesSchema } from "../models/countries";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const countries = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all countries",
      description: "Get all countries with optional search",
      path: "/countries",
      tags: ["Country"]
    })
    .input(GetCountriesSchema)
    .output(z.array(CountrySchema))
    .handler(async ({ input }) => {
      const { search } = input;

      let query = database.selectFrom('countries');

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where('country_name', 'ilike', p);
      }

      return await query
        .selectAll()
        .orderBy('country_name', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one country",
      description: "Get a country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"]
    })
    .input(z.object({ countryId: z.string().uuid() }))
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('countries')
        .where('id', '=', input.countryId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a country",
      description: "Create a new country",
      path: "/countries",
      tags: ["Country"]
    })
    .input(CreateCountrySchema)
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('countries')
        .where('country_name', 'ilike', input.country_name)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A country with this name already exists" });
      }

      const country = await database
        .insertInto('countries')
        .values({
          ...input,
          id: uuidv4(),
          updated_at: new Date(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!country) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create country" });
      }

      return country;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a country",
      description: "Update an existing country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"]
    })
    .input(z.object({ countryId: z.string().uuid() }).merge(UpdateCountrySchema))
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const { countryId, ...data } = input;

      const existing = await database
        .selectFrom('countries')
        .where('id', '=', countryId)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      const country = await database
        .updateTable('countries')
        .set({ ...data, updated_at: new Date() })
        .where('id', '=', countryId)
        .returningAll()
        .executeTakeFirst();

      if (!country) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update country" });
      }

      return country;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a country",
      description: "Delete a country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"]
    })
    .input(z.object({ countryId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('countries')
        .where('id', '=', input.countryId)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      await database
        .deleteFrom('countries')
        .where('id', '=', input.countryId)
        .execute();

      return { success: true };
    }),
};