import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { CertificationSchema, CreateCertificationSchema, UpdateCertificationSchema, GetCertificationsSchema } from "../models/certifications";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const certifications = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all certifications",
      description: "Get all certifications with optional filters",
      path: "/certifications",
      tags: ["Certification"]
    })
    .input(GetCertificationsSchema)
    .output(z.array(CertificationSchema))
    .handler(async ({ input }) => {
      const { search, category, difficulty } = input;

      let query = database.selectFrom('certifications').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('name', 'ilike', p).or('description', 'ilike', p)
        );
      }

      if (category) {
        query = query.where('category', '=', category);
      }

      if (difficulty) {
        query = query.where('difficulty', '=', difficulty);
      }

      return await query
        .selectAll()
        .orderBy('name', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one certification",
      description: "Get a certification by its ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"]
    })
    .input(z.object({ certificationId: z.string().uuid() }))
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('certifications')
        .where('id', '=', input.certificationId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a certification",
      description: "Create a new certification",
      path: "/certifications",
      tags: ["Certification"]
    })
    .input(CreateCertificationSchema)
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('certifications')
        .where('name', 'ilike', input.name)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A certification with this name already exists" });
      }

      const { metadata, ...rest } = input;

      const certification = await database
        .insertInto('certifications')
        .values({
          ...rest,
          id: uuidv4(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!certification) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create certification" });
      }

      return certification;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a certification",
      description: "Update an existing certification by its ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"]
    })
    .input(z.object({ certificationId: z.string().uuid() }).merge(UpdateCertificationSchema))
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const { certificationId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('certifications')
        .where('id', '=', certificationId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
      }

      const certification = await database
        .updateTable('certifications')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', certificationId)
        .returningAll()
        .executeTakeFirst();

      if (!certification) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update certification" });
      }

      return certification;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a certification",
      description: "Soft delete a certification by its ID",
      path: "/certifications/{certificationId}",
      tags: ["Certification"]
    })
    .input(z.object({ certificationId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('certifications')
        .where('id', '=', input.certificationId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
      }

      await database
        .updateTable('certifications')
        .set({ deleted_at: new Date() })
        .where('id', '=', input.certificationId)
        .execute();

      return { success: true };
    }),
};