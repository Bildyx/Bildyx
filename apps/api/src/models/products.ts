import { z } from "zod";

export const SubjectCategoryEnum = z.enum(["API", "HARDWARE", "OTHER", "PHYSICAL_PRODUCT", "PLATFORM", "SERVICE", "SOFTWARE"]);

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  type: z.string().nullable(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  category: SubjectCategoryEnum.nullable(),
  competitors: z.array(z.string()).nullable(),
  fun_fact: z.string().nullable(),
  organization_id: z.string().uuid().nullable(),
  website_url: z.string().nullable(),
  logo_url: z.string().nullable(),
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
  category: SubjectCategoryEnum.optional(),
  organization_id: z.string().uuid().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;