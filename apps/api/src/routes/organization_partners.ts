import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationPartnerSchema,
  PostOrganizationPartnerSchema,
  PutOrganizationPartnerSchema,
  GetOrganizationPartnersSchema,
  GetOrganizationPartnerSchema,
  DeleteOrganizationPartnerSchema,
} from "../models/organization_partners";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_partners = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization partners",
      path: "/organization-partners",
      tags: ["Organization Partner"],
    })
    .input(GetOrganizationPartnersSchema)
    .output(z.array(OrganizationPartnerSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_partners");
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      if (input.partner_id) {
        query = query.where("partner_id", "=", input.partner_id);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization partner by ID",
      path: "/organization-partners/{organizationPartnerId}",
      tags: ["Organization Partner"],
    })
    .input(GetOrganizationPartnerSchema)
    .output(OrganizationPartnerSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_partners")
        .selectAll()
        .where("id", "=", input.organizationPartnerId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization partner not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization partner relationship",
      path: "/organization-partners",
      tags: ["Organization Partner"],
    })
    .input(PostOrganizationPartnerSchema)
    .output(OrganizationPartnerSchema)
    .handler(async ({ input }) => {
      const relationship = await database
        .insertInto("organization_partners")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization partner",
        });
      }
      return relationship as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization partner relationship",
      path: "/organization-partners/{organizationPartnerId}",
      tags: ["Organization Partner"],
    })
    .input(
      z
        .object({ organizationPartnerId: z.uuid() })
        .merge(PutOrganizationPartnerSchema),
    )
    .output(OrganizationPartnerSchema)
    .handler(async ({ input }) => {
      const { organizationPartnerId, ...data } = input;
      const relationship = await database
        .updateTable("organization_partners")
        .set(data)
        .where("id", "=", organizationPartnerId)
        .returningAll()
        .executeTakeFirst();
      if (!relationship) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization partner not found",
        });
      }
      return relationship as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization partner relationship",
      path: "/organization-partners/{organizationPartnerId}",
      tags: ["Organization Partner"],
    })
    .input(DeleteOrganizationPartnerSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_partners")
        .selectAll()
        .where("id", "=", input.organizationPartnerId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization partner not found",
        });
      }
      await database
        .deleteFrom("organization_partners")
        .where("id", "=", input.organizationPartnerId)
        .execute();
    }),
};
