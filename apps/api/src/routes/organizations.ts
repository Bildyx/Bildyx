import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
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
      const { name, type } = input;

      let query = database
        .selectFrom("organizations")
        .where("deleted_at", "is", null);

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("mission", "ilike", p),
        );
      }

      if (type) {
        query = query.where("type", "=", type);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
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
        .where("deleted_at", "is", null)
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
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "An organization with this slug already exists",
        });
      }

      const { metadata, ...rest } = input;

      const organization = await database
        .insertInto("organizations")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
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
    .input(
      z
        .object({ organizationId: z.string().uuid() })
        .merge(PutOrganizationSchema),
    )
    .output(OrganizationSchema)
    .handler(async ({ input }) => {
      const { organizationId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("organizations")
        .where("id", "=", organizationId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      const organization = await database
        .updateTable("organizations")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
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
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }

      await database
        .updateTable("organizations")
        .set({ deleted_at: new Date() })
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
        .updateTable("organizations")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.organizationIds)
        .execute();
    }),
};
