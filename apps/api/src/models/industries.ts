import { z } from "zod";

export const IndustrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  description: z.string().nullable(),
  icon_url: z.string().nullable(),
  color: z.string().nullable(),
  median_salary: z.number().int().nullable(),
  parent_industry_id: z.string().uuid().nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateIndustrySchema = IndustrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateIndustrySchema = CreateIndustrySchema.partial();

export const GetIndustriesSchema = z.object({
  search: z.string().optional(),
  parent_industry_id: z.string().uuid().optional(),
});

export type Industry = z.infer<typeof IndustrySchema>;
export type CreateIndustry = z.infer<typeof CreateIndustrySchema>;
export type UpdateIndustry = z.infer<typeof UpdateIndustrySchema>;