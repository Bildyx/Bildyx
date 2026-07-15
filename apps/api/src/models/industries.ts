import { z } from "zod";

export const IndustrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetIndustriesSchema = z.object({
  name: z.string().optional(),
});

export const GetIndustrySchema = z.object({
  industryId: z.string().uuid(),
});

// POST
export const PostIndustrySchema = IndustrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutIndustrySchema = PostIndustrySchema.partial();

// DELETE
export const DeleteIndustrySchema = z.object({
  industryId: z.string().uuid(),
});

export const DeleteIndustriesBulkSchema = z.object({
  industryIds: z.array(z.string().uuid()),
});

export type Industry = z.infer<typeof IndustrySchema>;
export type PostIndustry = z.infer<typeof PostIndustrySchema>;
export type PutIndustry = z.infer<typeof PutIndustrySchema>;
