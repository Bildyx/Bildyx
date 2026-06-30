import { z } from "zod";
import {
  ContractTypeEnum,
  EducationLevelEnum,
  JobAdStatusEnum,
  RemotePolicyEnum,
} from "./utils/enums";

export const JobAdSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1),
  organization_id: z.string().uuid(),
  job_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  status: JobAdStatusEnum.optional().default("DRAFT"),
  contract_type: ContractTypeEnum.nullable().optional(),
  remote: RemotePolicyEnum.nullable().optional(),
  country_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  salary_range: z.string().nullable().optional(),
  required_years_experience: z.number().int().min(0).nullable().optional(),
  required_education_level: EducationLevelEnum.nullable().optional(),
  application_url: z.string().nullable().optional(),
  application_email: z.string().nullable().optional(),
  published_at: z.coerce.date().nullable().optional(),
  expires_at: z.coerce.date().nullable().optional(),
  tags: z.preprocess((val) => {
    if (Array.isArray(val)) {
      const filtered = val.filter((v) => v !== "");
      return filtered.length === 0 ? null : filtered;
    }
    return val === "" ? null : val;
  }, z.array(z.string()).nullable().optional()),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateJobAdSchema = JobAdSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  status: true,
  serialNumber: true,
}).extend({
  serialNumber: z.string().trim().min(1),
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
