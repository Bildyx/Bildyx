import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { sql } from "kysely";
import {
  OrganizationSchema,
  PostOrganizationSchema,
  PutOrganizationSchema,
  GetOrganizationsSchema,
  GetOrganizationSchema,
  DeleteOrganizationSchema,
  DeleteOrganizationsBulkSchema,
} from "../models/organizations";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organizations = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organizations",
      description: "Get all organizations with optional filters",
      path: "/organizations",
      tags: ["Organization"],
    })
    .input(GetOrganizationsSchema)
    .output(z.array(OrganizationSchema))
    .handler(async ({ input }) => {
      const {
        name,
        subtypes,
        city,
        country,
        sizes,
        keyword,
        productFilter,
        userExperienceKeywords,
      } = input;

      let query = database
        .selectFrom("organizations")
        .leftJoin("cities", "cities.id", "organizations.city_id")
        .leftJoin("countries", "countries.iso_code", "cities.country_id")
        .selectAll("organizations");

      if (name) {
        query = query.where("organizations.name", "ilike", `%${name.trim()}%`);
      }

      if (subtypes && subtypes.length > 0) {
        query = query.where((eb) => {
          const conditions = [eb("organizations.subtype", "in", subtypes)];
          if (subtypes.includes("COMPANY")) {
            conditions.push(eb("organizations.subtype", "is", null));
          }
          return eb.or(conditions);
        });
      }

      if (city) {
        query = query.where("cities.name", "ilike", `%${city.trim()}%`);
      }

      if (country) {
        query = query.where("countries.name", "ilike", `%${country.trim()}%`);
      }

      if (sizes && sizes.length > 0) {
        query = query.where("organizations.numberOfEmployees", "in", sizes);
      }
      if (keyword) {
        const kp = `%${keyword.trim()}%`;
        query = query.where((eb) =>
          eb("organizations.name", "ilike", kp)
            .or("organizations.description", "ilike", kp)
            .or("organizations.mission", "ilike", kp)
            .or(
              sql`array_to_string(coalesce(organizations.products, array[]::text[]), ' ')`,
              "ilike",
              kp,
            )
            .or(
              sql`array_to_string(coalesce(organizations.services, array[]::text[]), ' ')`,
              "ilike",
              kp,
            ),
        );
      }

      // ✅ Correction 'productFilter' : Binding sécurisé avec sql.val
      if (
        productFilter &&
        userExperienceKeywords &&
        userExperienceKeywords.length > 0
      ) {
        const conditions = userExperienceKeywords.map((k) => {
          const kp = `%${k.trim()}%`;
          return sql<boolean>`(
        array_to_string(coalesce(organizations.products, array[]::text[]), ' ') ilike ${sql.val(kp)} 
        or array_to_string(coalesce(organizations.services, array[]::text[]), ' ') ilike ${sql.val(kp)}
      )`;
        });

        if (productFilter === "same" || productFilter === "similar") {
          query = query.where((eb) => eb.or(conditions));
        } else if (productFilter === "different") {
          query = query.where((eb) => eb.not(eb.or(conditions)));
        }
      }

      return await query.orderBy("organizations.name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one organization",
      description: "Get an organization by its ID",
      path: "/organizations/{organizationId}",
      tags: ["Organization"],
    })
    .input(GetOrganizationSchema)
    .output(OrganizationSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organizations")
        .where("id", "=", input.organizationId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create an organization",
      description: "Create a new organization",
      path: "/organizations",
      tags: ["Organization"],
    })
    .input(PostOrganizationSchema)
    .output(OrganizationSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organizations")
        .where("slug", "=", input.slug)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "An organization with this slug already exists",
        });
      }

      const { ...rest } = input;

      const organization = await database
        .insertInto("organizations")
        .values({
          ...rest,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!organization) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization",
        });
      }

      return organization;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update an organization",
      description: "Update an existing organization by its ID",
      path: "/organizations/{organizationId}",
      tags: ["Organization"],
    })
    .input(z.object({ organizationId: z.uuid() }).merge(PutOrganizationSchema))
    .output(OrganizationSchema)
    .handler(async ({ input }) => {
      const { organizationId, ...rest } = input;

      const existing = await database
        .selectFrom("organizations")
        .where("id", "=", organizationId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      const organization = await database
        .updateTable("organizations")
        .set({
          ...rest,
        } as any)
        .where("id", "=", organizationId)
        .returningAll()
        .executeTakeFirst();

      if (!organization) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update organization",
        });
      }

      return organization;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete an organization",
      description: "Soft delete an organization by its ID",
      path: "/organizations/{organizationId}",
      tags: ["Organization"],
    })
    .input(DeleteOrganizationSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organizations")
        .where("id", "=", input.organizationId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      await database
        .deleteFrom("organizations")
        .where("id", "=", input.organizationId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple organizations",
      description: "Soft delete multiple existing organizations by their IDs",
      path: "/organizations",
      tags: ["Organization"],
    })
    .input(DeleteOrganizationsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("organizations")
        .where("id", "in", input.organizationIds)
        .execute();
    }),
};
