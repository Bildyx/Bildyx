import { z } from "zod";
import { JobCategoryEnum, SeniorityLevelEnum } from "./utils/enums";

const currentYear = () => new Date().getFullYear();

export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  category: JobCategoryEnum.nullable().optional(),
  description: z.string().nullable().optional(),
  seniority_level: SeniorityLevelEnum.nullable().optional(),
  is_elected: z.boolean().optional().default(false),
  is_regulated: z.boolean().optional().default(false),
  start_year: z
    .number()
    .int()
    .min(0)
    .max(currentYear())
    .nullable()
    .optional(),
  industry_id: z.string().uuid().nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  products: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  tools_and_tech: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  tags: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  score: z.number().int().min(0).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateJobSchema = JobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
});

export const UpdateJobSchema = CreateJobSchema.partial();

export const GetJobsSchema = z.object({
  search: z.string().optional(),
  category: JobCategoryEnum.optional(),
  seniority_level: SeniorityLevelEnum.optional(),
  industry_id: z.string().uuid().optional(),
  country_id: z.string().uuid().optional(),
});

export type Job = z.infer<typeof JobSchema>;
export type CreateJob = z.infer<typeof CreateJobSchema>;
export type UpdateJob = z.infer<typeof UpdateJobSchema>;