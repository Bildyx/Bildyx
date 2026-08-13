import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import {
  OrganizationPhotoSchema,
  PostOrganizationPhotoSchema,
  PutOrganizationPhotoSchema,
  GetOrganizationPhotosSchema,
  GetOrganizationPhotoSchema,
  DeleteOrganizationPhotoSchema,
} from "../models/organization_photos";
import { database } from "../database";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const organization_photos = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all organization photos",
      path: "/organization-photos",
      tags: ["Organization Photo"],
    })
    .input(GetOrganizationPhotosSchema)
    .output(z.array(OrganizationPhotoSchema))
    .handler(async ({ input }) => {
      let query = database.selectFrom("organization_photos");
      if (input.organization_id) {
        query = query.where("organization_id", "=", input.organization_id);
      }
      return (await query.selectAll().execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a organization photo by ID",
      path: "/organization-photos/{organizationPhotoId}",
      tags: ["Organization Photo"],
    })
    .input(GetOrganizationPhotoSchema)
    .output(OrganizationPhotoSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("organization_photos")
        .selectAll()
        .where("id", "=", input.organizationPhotoId)
        .executeTakeFirst();
      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization photo not found",
        });
      }
      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a organization photo",
      path: "/organization-photos",
      tags: ["Organization Photo"],
    })
    .input(PostOrganizationPhotoSchema)
    .output(OrganizationPhotoSchema)
    .handler(async ({ input }) => {
      const photo = await database
        .insertInto("organization_photos")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();
      if (!photo) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create organization photo",
        });
      }
      return photo as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a organization photo",
      path: "/organization-photos/{organizationPhotoId}",
      tags: ["Organization Photo"],
    })
    .input(
      z
        .object({ organizationPhotoId: z.uuid() })
        .merge(PutOrganizationPhotoSchema),
    )
    .output(OrganizationPhotoSchema)
    .handler(async ({ input }) => {
      const { organizationPhotoId, ...data } = input;
      const photo = await database
        .updateTable("organization_photos")
        .set(data)
        .where("id", "=", organizationPhotoId)
        .returningAll()
        .executeTakeFirst();
      if (!photo) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization photo not found",
        });
      }
      return photo as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a organization photo",
      path: "/organization-photos/{organizationPhotoId}",
      tags: ["Organization Photo"],
    })
    .input(DeleteOrganizationPhotoSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("organization_photos")
        .selectAll()
        .where("id", "=", input.organizationPhotoId)
        .executeTakeFirst();
      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "Organization photo not found",
        });
      }
      await database
        .deleteFrom("organization_photos")
        .where("id", "=", input.organizationPhotoId)
        .execute();
    }),
};
