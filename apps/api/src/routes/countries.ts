import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  CountrySchema,
  PostCountrySchema,
  PutCountrySchema,
  GetCountriesSchema,
  GetCountrySchema,
  DeleteCountrySchema,
  DeleteCountriesBulkSchema,
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
    .input(GetCountrySchema)
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("countries")
        .where("iso_code", "=", input.countryId)
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
    .input(PostCountrySchema)
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("countries")
        .where("name", "ilike", input.name)
        .select("iso_code")
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
      method: "PATCH",
      summary: "Update a country",
      description: "Update an existing country by its ID",
      path: "/countries/{countryId}",
      tags: ["Country"],
    })
    .input(z.object({ countryId: z.string().length(2) }).merge(PutCountrySchema))
    .output(CountrySchema)
    .handler(async ({ input }) => {
      const { countryId, metadata, ...data } = input;

      const existing = await database
        .selectFrom("countries")
        .where("iso_code", "=", countryId)
        .select("iso_code")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      const country = await database
        .updateTable("countries")
        .set({ ...data, updated_at: new Date() } as any)
        .where("iso_code", "=", countryId)
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
    .input(DeleteCountrySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("countries")
        .where("iso_code", "=", input.countryId)
        .select("iso_code")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Country not found" });
      }

      await database
        .deleteFrom("countries")
        .where("iso_code", "=", input.countryId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple countries",
      description: "Delete multiple existing countries by their IDs",
      path: "/countries",
      tags: ["Country"],
    })
    .input(DeleteCountriesBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("countries")
        .where("iso_code", "in", input.countryIds)
        .execute();
    }),
};
