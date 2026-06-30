import { z } from "zod";

export const IndustrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  icon_url: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateIndustrySchema = IndustrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
});

export const UpdateIndustrySchema = CreateIndustrySchema.partial();

export const GetIndustriesSchema = z.object({
  search: z.string().optional(),
});

export type Industry = z.infer<typeof IndustrySchema>;
export type CreateIndustry = z.infer<typeof CreateIndustrySchema>;
export type UpdateIndustry = z.infer<typeof UpdateIndustrySchema>;
