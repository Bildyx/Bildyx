import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetCertificationsSchema,
  GetCertificationSchema,
  CertificationSchema,
  PostCertificationSchema,
  PutCertificationSchema,
  DeleteCertificationSchema,
  DeleteCertificationsBulkSchema,
} from "../models/certifications";
import { z } from "zod";
import { randomUUID } from "crypto";
import type { Insertable } from "kysely";
import type { Certifications } from "../db/types";

export const certifications = {
  // 1. Get all certifications for a company
  getByOrganization: publicProcedure
    .route({
      method: "GET",
      summary: "List all certifications for an organization",
      description:
        "Get all certifications for an organization with optional filters",
      path: "/organizations/{organizationId}/certifications",
      tags: ["Certification"],
    })
    .input(GetCertificationsSchema)
    .output(z.array(CertificationSchema))
    .handler(async ({ input }) => {
      const { organizationId, name, category } = input;

      if (organizationId) {
        const organization = await database
          .selectFrom("organizations")
          .where("id", "=", organizationId)
          .select("id")
          .executeTakeFirst();

        if (!organization) {
          throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
        }
      }

      let query = database.selectFrom("certifications").selectAll();

      if (organizationId) {
        query = query.where("issuing_organization_id", "=", organizationId);
      }

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (category) {
        query = query.where("category", "=", category);
      }

      const certificationsData = await query
        .orderBy("created_at", "desc")
        .execute();

      return certificationsData;
    }),

  // 2. Get all certifications
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all certifications",
      description: "Get all certifications",
      path: "/certifications",
      tags: ["Certification"],
    })
    .output(z.array(CertificationSchema))
    .handler(async () => {
      let query = database.selectFrom("certifications").selectAll();

      const certificationsData = await query
        .orderBy("created_at", "desc")
        .execute();

      return certificationsData;
    }),

  // 3. Get a single certification by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific certification",
      description: "Get a specific certification by its unique ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"],
    })
    .input(GetCertificationSchema)
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const { certificationId } = input;

      const cert = await database
        .selectFrom("certifications")
        .selectAll()
        .where("id", "=", certificationId)
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "Certification not found",
        });
      }

      return cert;
    }),

  // 4. Create a new certification
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a new certification",
      description: "Create a new certification entry",
      path: "/certifications",
      tags: ["Certification"],
    })
    .input(PostCertificationSchema)
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const cert = await database
        .insertInto("certifications")
        .values({
          id: randomUUID(),
          updated_at: new Date(),
          ...input,
        } as Insertable<Certifications>)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create certification",
        });
      }

      return cert;
    }),

  // 5. Update a certification
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a certification",
      description: "Update an existing certification by its ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"],
    })
    .input(
      z.object({ certificationId: z.uuid() }).merge(PutCertificationSchema),
    )
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const { certificationId, ...updates } = input;

      const cert = await database
        .updateTable("certifications")
        .set({
          ...updates,
          updated_at: new Date(),
        } as Insertable<Certifications>)
        .where("id", "=", certificationId)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "Certification not found",
        });
      }

      return cert;
    }),

  // 6. Supprimer une certification par son ID
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a certification",
      description: "Delete an existing certification by its ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"],
    })
    .input(DeleteCertificationSchema)
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const { certificationId } = input;

      const cert = await database
        .deleteFrom("certifications")
        .where("id", "=", certificationId)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", {
          message: "Certification not found",
        });
      }

      return cert;
    }),

  // 7. Supprimer plusieurs certifications (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple certifications",
      description: "Delete multiple existing certifications by their IDs",
      path: "/certifications",
      tags: ["Certification"],
    })
    .input(DeleteCertificationsBulkSchema)
    .output(z.array(CertificationSchema))
    .handler(async ({ input }) => {
      const { certificationIds } = input;

      if (certificationIds.length === 0) {
        return [];
      }

      const certs = await database
        .deleteFrom("certifications")
        .where("id", "in", certificationIds)
        .returningAll()
        .execute();

      return certs;
    }),
};
