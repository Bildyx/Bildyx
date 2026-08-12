import { z } from "zod";
import { JobCategoryEnum, SeniorityLevelEnum } from "./utils/enums";
import { zNullableUUID, zStringArray } from "./utils/preprocessors";

const currentYear = () => new Date().getFullYear();

export const JobSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  category: JobCategoryEnum.nullable().optional(),
  description: z.string().nullable().optional(),
  seniority_level: SeniorityLevelEnum.nullable().optional(),
  industry_id: zNullableUUID(),
  products: zStringArray(),
  tools_and_tech: zStringArray(),
  tags: zStringArray(),
  score: z.number().int().min(0).nullable().optional(),
});

// GET
export const GetJobsSchema = z.object({
  name: z.string().optional(),
  category: JobCategoryEnum.optional(),
  seniority_level: SeniorityLevelEnum.optional(),
  industry_id: zNullableUUID(),
});

export const GetJobSchema = z.object({
  jobId: z.uuid(),
});

// POST
export const PostJobSchema = JobSchema.omit({
  id: true,
});

// PATCH
export const PutJobSchema = PostJobSchema.partial();

// DELETE
export const DeleteJobSchema = z.object({
  jobId: z.uuid(),
});

export const DeleteJobsBulkSchema = z.object({
  jobIds: z.array(z.uuid()),
});

export type Job = z.infer<typeof JobSchema>;
export type PostJob = z.infer<typeof PostJobSchema>;
export type PutJob = z.infer<typeof PutJobSchema>;
