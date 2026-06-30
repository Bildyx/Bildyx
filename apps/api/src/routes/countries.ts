import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  CountrySchema,
  CreateCountrySchema,
  UpdateCountrySchema,
  GetCountriesSchema,
} from "../models/countries";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const countries = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all countries",
      description: "Get all countries with optional search",
      path: "/countries",
      tags: ["Country"],
    })
    .input(GetCountriesSchema)
    .output(z.array(CountrySchema))
    .handler(async ({ input }) => {
      const { name } = input;

      let query = database.selectFrom("countries");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where("name", "ilike", p);
      }

      const results = await query.selectAll().orderBy("name", "asc").execute();

      return results;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific country",
      description: "Get a country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"],
    })
    .input(z.object({ countryId: z.string().uuid() }))
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("countries")
        .where("id", "=", input.countryId)
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
      tags: ["Country"],
    })
    .input(CreateCountrySchema)
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("countries")
        .where("name", "ilike", input.name)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A country with this name already exists",
        });
      }

      const { metadata, ...rest } = input;

      const country = await database
        .insertInto("countries")
        .values({
          ...input,
          id: randomUUID(),
          updated_at: new Date(),
        } as any)
        .returningAll()
        .executeTakeFirst();

      if (!country) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create country",
        });
      }

      return country;
    }),

  update: publicProcedure
    .route({
      method: "PUT",
      summary: "Update a country",
      description: "Update an existing country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"],
    })
    .input(
      z.object({ countryId: z.string().uuid() }).merge(UpdateCountrySchema),
    )
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const { countryId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("countries")
        .where("id", "=", countryId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      const country = await database
        .updateTable("countries")
        .set({ ...data, updated_at: new Date() } as any)
        .where("id", "=", countryId)
        .returningAll()
        .executeTakeFirst();

      if (!country) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update country",
        });
      }

      return country;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a country",
      description: "Soft delete a country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"],
    })
    .input(z.object({ countryId: z.string().uuid() }))
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("countries")
        .where("id", "=", input.countryId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      await database
        .deleteFrom("countries")
        .where("id", "=", input.countryId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple countries",
      description: "Delete multiple existing countries by their IDs",
      path: "/countries/bulk",
      tags: ["Country"],
    })
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("countries")
        .where("id", "in", input.ids)
        .execute();
    }),
};
