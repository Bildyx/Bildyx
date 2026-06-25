import { z } from "zod";

export const ProductCategoryEnum = z.enum(["API", "HARDWARE", "OTHER", "PHYSICAL_PRODUCT", "PLATFORM", "SERVICE", "SOFTWARE"]);
export const PricingModelEnum = z.enum(["ENTERPRISE", "FREE", "FREEMIUM", "ONE_TIME", "OPEN_SOURCE", "OTHER", "SUBSCRIPTION"]);

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  type: z.string().nullable(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  category: ProductCategoryEnum.nullable(),
  competitors: z.array(z.string()).nullable(),
  fun_fact: z.string().nullable(),
  company_id: z.string().uuid().nullable(),
  website_url: z.string().nullable(),
  logo_url: z.string().nullable(),
  pricing_model: PricingModelEnum.nullable(),
  price_from: z.number().nullable(),
  price_currency: z.string().nullable(),
  is_deprecated: z.boolean(),
  launch_year: z.number().int().nullable(),
  documentation_url: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const GetProductsSchema = z.object({
  search: z.string().optional(),
  category: ProductCategoryEnum.optional(),
  pricing_model: PricingModelEnum.optional(),
  company_id: z.string().uuid().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;