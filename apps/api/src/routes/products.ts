import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  ProductSchema,
  CreateProductSchema,
  UpdateProductSchema,
  GetProductsSchema,
} from "../models/products";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const products = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all products",
      description: "Get all products with optional filters",
      path: "/products",
      tags: ["Product"],
    })
    .input(GetProductsSchema)
    .output(z.array(ProductSchema))
    .handler(async ({ input }) => {
      const { search, category, organization_id } = input;

      let query = database
        .selectFrom("products")
        .where("deleted_at", "is", null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (category) {
        query = query.where("category", "=", category);
      }
      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
      }

      return await query.selectAll().orderBy("name", "asc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one product",
      description: "Get a product by its ID",
      path: "/products/{productId}",
      tags: ["Product"],
    })
    .input(z.object({ productId: z.string().uuid() }))
    .output(ProductSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("products")
        .where("id", "=", input.productId)
        .where("deleted_at", "is", null)
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
      tags: ["Product"],
    })
    .input(CreateProductSchema)
    .output(ProductSchema)
    .handler(async ({ input }) => {
      let checkQuery = database
        .selectFrom("products")
        .where("name", "ilike", input.name)
        .where("deleted_at", "is", null);

      if (input.organization_id) {
        checkQuery = checkQuery.where(
          "organization_id",
          "=",
          input.organization_id,
        );
      } else {
        checkQuery = checkQuery.where("organization_id", "is", null);
      }

      const existing = await checkQuery.select("id").executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message:
            "A product with this name already exists for this organization",
        });
      }

      const { metadata, ...rest } = input;

      const product = await database
        .insertInto("products")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!product) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create product",
        });
      }

      return product;
    }),

  update: publicProcedure
    .route({
      method: "PUT",
      summary: "Update a product",
      description: "Update an existing product by its ID",
      path: "/products/{productId}",
      tags: ["Product"],
    })
    .input(
      z.object({ productId: z.string().uuid() }).merge(UpdateProductSchema),
    )
    .output(ProductSchema)
    .handler(async ({ input }) => {
      const { productId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("products")
        .where("id", "=", productId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const product = await database
        .updateTable("products")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", productId)
        .returningAll()
        .executeTakeFirst();

      if (!product) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update product",
        });
      }

      return product;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a product",
      description: "Soft delete a product by its ID",
      path: "/products/{productId}",
      tags: ["Product"],
    })
    .input(z.object({ productId: z.string().uuid() }))
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("products")
        .where("id", "=", input.productId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      await database
        .updateTable("products")
        .set({ deleted_at: new Date() })
        .where("id", "=", input.productId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple products",
      description: "Soft delete multiple existing products by their IDs",
      path: "/products",
      tags: ["Product"],
    })
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .updateTable("products")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.ids)
        .execute();
    }),
};
