import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { ProductSchema, CreateProductSchema, UpdateProductSchema, GetProductsSchema } from "../models/products";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const products = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all products",
      description: "Get all products with optional filters",
      path: "/products",
      tags: ["Product"]
    })
    .input(GetProductsSchema)
    .output(z.array(ProductSchema))
    .handler(async ({ input }) => {
      const { search, category, pricing_model, company_id } = input;

      let query = database.selectFrom('products').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('name', 'ilike', p).or('description', 'ilike', p)
        );
      }

      if (category) query = query.where('category', '=', category);
      if (pricing_model) query = query.where('pricing_model', '=', pricing_model);
      if (company_id) query = query.where('company_id', '=', company_id);

      return await query
        .selectAll()
        .orderBy('name', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one product",
      description: "Get a product by its ID",
      path: "/products/{productId}",
      tags: ["Product"]
    })
    .input(z.object({ productId: z.string().uuid() }))
    .output(ProductSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('products')
        .where('id', '=', input.productId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a product",
      description: "Create a new product",
      path: "/products",
      tags: ["Product"]
    })
    .input(CreateProductSchema)
    .output(ProductSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('products')
        .where('name', 'ilike', input.name)
        .$if(!!input.company_id, (qb) => qb.where('company_id', '=', input.company_id!))
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A product with this name already exists for this company" });
      }

      const { metadata, ...rest } = input;

      const product = await database
        .insertInto('products')
        .values({
          ...rest,
          id: uuidv4(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!product) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create product" });
      }

      return product;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a product",
      description: "Update an existing product by its ID",
      path: "/products/{productId}",
      tags: ["Product"]
    })
    .input(z.object({ productId: z.string().uuid() }).merge(UpdateProductSchema))
    .output(ProductSchema)
    .handler(async ({ input }) => {
      const { productId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('products')
        .where('id', '=', productId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const product = await database
        .updateTable('products')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', productId)
        .returningAll()
        .executeTakeFirst();

      if (!product) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update product" });
      }

      return product;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a product",
      description: "Soft delete a product by its ID",
      path: "/products/{productId}",
      tags: ["Product"]
    })
    .input(z.object({ productId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('products')
        .where('id', '=', input.productId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      await database
        .updateTable('products')
        .set({ deleted_at: new Date() })
        .where('id', '=', input.productId)
        .execute();

      return { success: true };
    }),
};