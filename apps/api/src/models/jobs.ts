import { z } from "zod";

export const JobCategoryEnum = z.enum(["ACADEMIC", "GOVERNMENT", "MILITARY", "NGO", "OTHER", "PRIVATE_SECTOR", "PUBLIC_SECTOR"]);
export const SeniorityLevelEnum = z.enum(["C_LEVEL", "DIRECTOR", "ELECTED", "INTERN", "JUNIOR", "LEAD", "MID", "OTHER", "SENIOR"]);

export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  serialNumber: z.string(),
  category: JobCategoryEnum.nullable(),
  description: z.string().nullable(),
  seniority_level: SeniorityLevelEnum.nullable(),
  is_elected: z.boolean(),
  is_regulated: z.boolean(),
  start_year: z.number().int().nullable(),
  industry_id: z.string().uuid().nullable(),
  country_id: z.string().uuid().nullable(),
  products: z.array(z.string()).nullable(),
  tools_and_tech: z.array(z.string()).nullable(),
  tags: z.array(z.string()).nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateJobSchema = JobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
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