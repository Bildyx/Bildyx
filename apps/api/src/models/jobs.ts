import { z } from "zod";
import { JobCategoryEnum, SeniorityLevelEnum } from "./utils/enums";
import { zNullableUUID, zStringArray } from "./utils/preprocessors";

const currentYear = () => new Date().getFullYear();

export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  category: JobCategoryEnum.nullable().optional(),
  description: z.string().nullable().optional(),
  seniority_level: SeniorityLevelEnum.nullable().optional(),
  industry_id: zNullableUUID(),
  products: zStringArray(),
  tools_and_tech: zStringArray(),
  tags: zStringArray(),
  metadata: z.any().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetJobsSchema = z.object({
  name: z.string().optional(),
  category: JobCategoryEnum.optional(),
  seniority_level: SeniorityLevelEnum.optional(),
  industry_id: z.string().uuid().optional(),
});

export const GetJobSchema = z.object({
  jobId: z.string().uuid(),
});

// POST
export const PostJobSchema = JobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutJobSchema = PostJobSchema.partial();

// DELETE
export const DeleteJobSchema = z.object({
  jobId: z.string().uuid(),
});

export const DeleteJobsBulkSchema = z.object({
  jobIds: z.array(z.string().uuid()),
});

export type Job = z.infer<typeof JobSchema>;
export type PostJob = z.infer<typeof PostJobSchema>;
export type PutJob = z.infer<typeof PutJobSchema>;
