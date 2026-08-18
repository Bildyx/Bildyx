import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationSubsidiarySchema,
  PostOrganizationSubsidiarySchema,
  PutOrganizationSubsidiarySchema,
  GetOrganizationSubsidiariesSchema,
  GetOrganizationSubsidiarySchema,
  DeleteOrganizationSubsidiarySchema,
} from "../models/organization_subsidiaries";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_subsidiaries = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization subsidiaries",
      path: "/organization-subsidiaries",
      tags: ["Organization Subsidiary"],
    })
    .input(GetOrganizationSubsidiariesSchema)
    .output(z.array(OrganizationSubsidiarySchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_subsidiaries");
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      if (input.subsidiary_id) {
        query = query.where("subsidiary_id", "=", input.subsidiary_id);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization subsidiary by ID",
      path: "/organization-subsidiaries/{organizationSubsidiaryId}",
      tags: ["Organization Subsidiary"],
    })
    .input(GetOrganizationSubsidiarySchema)
    .output(OrganizationSubsidiarySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_subsidiaries")
        .selectAll()
        .where("id", "=", input.organizationSubsidiaryId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization subsidiary not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization subsidiary relationship",
      path: "/organization-subsidiaries",
      tags: ["Organization Subsidiary"],
    })
    .input(PostOrganizationSubsidiarySchema)
    .output(OrganizationSubsidiarySchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("organization_subsidiaries")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization subsidiary",
        });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization subsidiary relationship",
      path: "/organization-subsidiaries/{organizationSubsidiaryId}",
      tags: ["Organization Subsidiary"],
    })
    .input(
      z
        .object({ organizationSubsidiaryId: z.uuid() })
        .merge(PutOrganizationSubsidiarySchema),
    )
    .output(OrganizationSubsidiarySchema)
    .handler(async ({ input }) => {
      const { organizationSubsidiaryId, ...data } = input;
      const relationship = await database
        .updateTable("organization_subsidiaries")
        .set(data)
        .where("id", "=", organizationSubsidiaryId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization subsidiary not found",
        });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization subsidiary relationship",
      path: "/organization-subsidiaries/{organizationSubsidiaryId}",
      tags: ["Organization Subsidiary"],
    })
    .input(DeleteOrganizationSubsidiarySchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_subsidiaries")
        .selectAll()
        .where("id", "=", input.organizationSubsidiaryId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization subsidiary not found",
        });
      }
      await database
        .deleteFrom("organization_subsidiaries")
        .where("id", "=", input.organizationSubsidiaryId)
        .execute();
    }),
};
