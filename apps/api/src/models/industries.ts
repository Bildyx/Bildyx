import { z } from "zod";

export const IndustrySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetIndustriesSchema = z.object({
  name: z.string().optional(),
});

export const GetIndustrySchema = z.object({
  industryId: z.uuid(),
});

// POST
export const PostIndustrySchema = IndustrySchema.omit({
  id: true,
});

// PATCH
export const PutIndustrySchema = PostIndustrySchema.partial();

// DELETE
export const DeleteIndustrySchema = z.object({
  industryId: z.uuid(),
});

export const DeleteIndustriesBulkSchema = z.object({
  industryIds: z.array(z.uuid()),
});

export type Industry = z.infer<typeof IndustrySchema>;
export type PostIndustry = z.infer<typeof PostIndustrySchema>;
export type PutIndustry = z.infer<typeof PutIndustrySchema>;
