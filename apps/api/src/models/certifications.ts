import { z } from "zod";
import { CertificationCategoryEnum, DifficultyLevelEnum } from "./utils/enums";
import { zNullableUUID } from "./utils/preprocessors";

export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1).nullable(),
  issuing_organization_id: zNullableUUID(),
  description: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: CertificationCategoryEnum.nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  jobs: z.array(z.string()).nullable().optional(),
  validity_duration_months: z.number().int().min(0).nullable().optional(),
  difficulty: DifficultyLevelEnum.nullable().optional(),
  website_url: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetCertificationsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().optional(),
  category: CertificationCategoryEnum.optional(),
});

export const GetCertificationSchema = z.object({
  certificationId: z.string().uuid(),
});

// POST
export const PostCertificationSchema = z.object({
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  issuing_organization_id: zNullableUUID(),
  description: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: CertificationCategoryEnum.nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  jobs: z.array(z.string()).nullable().optional(),
  validity_duration_months: z.number().int().min(0).nullable().optional(),
  difficulty: DifficultyLevelEnum.nullable().optional(),
  website_url: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

// PATCH
export const PutCertificationSchema = PostCertificationSchema.partial();

// DELETE
export const DeleteCertificationSchema = z.object({
  certificationId: z.string().uuid(),
});

export const DeleteCertificationsBulkSchema = z.object({
  certificationIds: z.array(z.string().uuid()),
});

export type Certification = z.infer<typeof CertificationSchema>;
export type PostCertification = z.infer<typeof PostCertificationSchema>;
export type PutCertification = z.infer<typeof PutCertificationSchema>;
