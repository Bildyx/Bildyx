import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { IndustrySchema, CreateIndustrySchema, UpdateIndustrySchema, GetIndustriesSchema } from "../models/industries";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const industries = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all industries",
      description: "Get all industries with optional search",
      path: "/industries",
      tags: ["Industry"]
    })
    .input(GetIndustriesSchema)
    .output(z.array(IndustrySchema))
    .handler(async ({ input }) => {
      const { search } = input;

      let query = database.selectFrom('industries').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('name', 'ilike', p).or('description', 'ilike', p)
        );
      }

      return await query.selectAll().orderBy('name', 'asc').execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one industry",
      description: "Get an industry by its ID",
      path: "/industries/{industryId}",
      tags: ["Industry"]
    })
    .input(z.object({ industryId: z.string().uuid() }))
    .output(IndustrySchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('industries')
        .where('id', '=', input.industryId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) throw new ORPCError("NOT_FOUND", { message: "Industry not found" });

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create an industry",
      description: "Create a new industry",
      path: "/industries",
      tags: ["Industry"]
    })
    .input(CreateIndustrySchema)
    .output(IndustrySchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('industries')
        .where('name', 'ilike', input.name)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) throw new ORPCError("CONFLICT", { message: "An industry with this name already exists" });

      const { metadata, ...rest } = input;

      const industry = await database
        .insertInto('industries')
        .values({ ...rest, id: uuidv4(), updated_at: new Date(), metadata: metadata as any })
        .returningAll()
        .executeTakeFirst();

      if (!industry) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create industry" });

      return industry;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update an industry",
      description: "Update an existing industry by its ID",
      path: "/industries/{industryId}",
      tags: ["Industry"]
    })
    .input(z.object({ industryId: z.string().uuid() }).merge(UpdateIndustrySchema))
    .output(IndustrySchema)
    .handler(async ({ input }) => {
      const { industryId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('industries')
        .where('id', '=', industryId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Industry not found" });

      const industry = await database
        .updateTable('industries')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', industryId)
        .returningAll()
        .executeTakeFirst();

      if (!industry) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update industry" });

      return industry;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete an industry",
      description: "Soft delete an industry by its ID",
      path: "/industries/{industryId}",
      tags: ["Industry"]
    })
    .input(z.object({ industryId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('industries')
        .where('id', '=', input.industryId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Industry not found" });

      await database.updateTable('industries').set({ deleted_at: new Date() }).where('id', '=', input.industryId).execute();

      return { success: true };
    }),
};