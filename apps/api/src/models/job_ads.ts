import { z } from "zod";
import {
  ContractTypeEnum,
  EducationLevelEnum,
  JobAdStatusEnum,
  RemotePolicyEnum,
} from "./utils/enums";
import { zNullableUUID, zStringArray } from "./utils/preprocessors";

export const JobAdSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  organization_id: z.string().uuid(),
  job_id: zNullableUUID(),
  description: z.string().nullable().optional(),
  status: JobAdStatusEnum.optional().default("DRAFT"),
  contract_type: ContractTypeEnum.nullable().optional(),
  remote: RemotePolicyEnum.nullable().optional(),
  country_id: z.string().length(2).nullable().optional(),
  city_id: zNullableUUID(),
  salary_range: z.string().nullable().optional(),
  required_years_experience: z.number().int().min(0).nullable().optional(),
  required_education_level: EducationLevelEnum.nullable().optional(),
  application_url: z.string().nullable().optional(),
  application_email: z.string().nullable().optional(),
  published_at: z.date().nullable().optional().default(null),
  expires_at: z.date().nullable().optional().default(null),
  tags: zStringArray(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetJobAdsSchema = z.object({
  name: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  contract_type: ContractTypeEnum.optional(),
  remote: RemotePolicyEnum.optional(),
  status: JobAdStatusEnum.optional(),
  country_id: z.string().length(2).optional(),
  city_id: z.string().uuid().optional(),
});

export const GetJobAdSchema = z.object({
  jobAdId: z.string().uuid(),
});

// POST
export const PostJobAdSchema = JobAdSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutJobAdSchema = PostJobAdSchema.partial();

// DELETE
export const DeleteJobAdSchema = z.object({
  jobAdId: z.string().uuid(),
});

export const DeleteJobAdsBulkSchema = z.object({
  jobAdIds: z.array(z.string().uuid()),
});

export type JobAd = z.infer<typeof JobAdSchema>;
export type PostJobAd = z.infer<typeof PostJobAdSchema>;
export type PutJobAd = z.infer<typeof PutJobAdSchema>;
