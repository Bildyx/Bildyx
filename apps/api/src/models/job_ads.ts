import { z } from "zod";

export const ContractTypeEnum = z.enum(["APPRENTICESHIP", "FREELANCE", "FULL_TIME", "INTERNSHIP", "OTHER", "PART_TIME"]);
export const RemotePolicyEnum = z.enum(["FULL_REMOTE", "HYBRID", "ON_SITE"]);
export const EducationLevelEnum = z.enum(["BACHELOR", "HIGH_SCHOOL", "MASTER", "NONE", "OTHER", "PHD"]);
export const JobAdStatusEnum = z.enum(["CLOSED", "DRAFT", "FILLED", "PUBLISHED"]);

export const JobAdSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  serialNumber: z.string(),
  organization_id: z.string().uuid(),
  job_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  status: JobAdStatusEnum,
  contract_type: ContractTypeEnum.nullable(),
  remote: RemotePolicyEnum.nullable(),
  country_id: z.string().uuid().nullable(),
  city_id: z.string().uuid().nullable(),
  salary_range: z.string().nullable(),
  required_years_experience: z.number().int().nullable(),
  required_education_level: EducationLevelEnum.nullable(),
  application_url: z.string().nullable(),
  application_email: z.string().nullable(),
  published_at: z.date().nullable(),
  expires_at: z.date().nullable(),
  tags: z.array(z.string()).nullable(),
  metadata: z.unknown().nullable(),
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateJobAdSchema = JobAdSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  status: true,
});

export const UpdateJobAdSchema = CreateJobAdSchema.partial();

export const GetJobAdsSchema = z.object({
  search: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  contract_type: ContractTypeEnum.optional(),
  remote: RemotePolicyEnum.optional(),
  status: JobAdStatusEnum.optional(),
  country_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
});

export type JobAd = z.infer<typeof JobAdSchema>;
export type CreateJobAd = z.infer<typeof CreateJobAdSchema>;
export type UpdateJobAd = z.infer<typeof UpdateJobAdSchema>;