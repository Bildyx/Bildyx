import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationOfficeSchema,
  PostOrganizationOfficeSchema,
  PutOrganizationOfficeSchema,
  GetOrganizationOfficesSchema,
  GetOrganizationOfficeSchema,
  DeleteOrganizationOfficeSchema,
} from "../models/organization_offices";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_offices = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization offices",
      path: "/organization-offices",
      tags: ["Organization Office"],
    })
    .input(GetOrganizationOfficesSchema)
    .output(z.array(OrganizationOfficeSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_offices");
      if (input.city_id) {
        query = query.where("city_id", "=", input.city_id);
      }
      if (input.type) {
        query = query.where("type", "ilike", `%${input.type.trim()}%`);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization office by ID",
      path: "/organization-offices/{organizationOfficeId}",
      tags: ["Organization Office"],
    })
    .input(GetOrganizationOfficeSchema)
    .output(OrganizationOfficeSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_offices")
        .selectAll()
        .where("id", "=", input.organizationOfficeId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization office not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization office",
      path: "/organization-offices",
      tags: ["Organization Office"],
    })
    .input(PostOrganizationOfficeSchema)
    .output(OrganizationOfficeSchema)
    .handler(async ({ input }) => {
      const office = await database
        .insertInto("organization_offices")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!office) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization office",
        });
      }
      return office as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization office",
      path: "/organization-offices/{organizationOfficeId}",
      tags: ["Organization Office"],
    })
    .input(
      z
        .object({ organizationOfficeId: z.uuid() })
        .merge(PutOrganizationOfficeSchema),
    )
    .output(OrganizationOfficeSchema)
    .handler(async ({ input }) => {
      const { organizationOfficeId, ...data } = input;
      const office = await database
        .updateTable("organization_offices")
        .set(data)
        .where("id", "=", organizationOfficeId)
        .returningAll()
        .executeTakeFirst();
      if (!office) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization office not found",
        });
      }
      return office as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization office",
      path: "/organization-offices/{organizationOfficeId}",
      tags: ["Organization Office"],
    })
    .input(DeleteOrganizationOfficeSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_offices")
        .selectAll()
        .where("id", "=", input.organizationOfficeId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization office not found",
        });
      }
      await database
        .deleteFrom("organization_offices")
        .where("id", "=", input.organizationOfficeId)
        .execute();
    }),
};
