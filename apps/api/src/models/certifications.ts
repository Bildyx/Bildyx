import { z } from "zod";

export const CertificationCategoryEnum = z.enum(["COMPLIANCE", "LANGUAGE", "OTHER", "PROFESSIONAL", "QUALITY", "SECURITY", "TECHNICAL"]);
export const DifficultyLevelEnum = z.enum(["ADVANCED", "BEGINNER", "EXPERT", "INTERMEDIATE"]);
export const RecognitionLevelEnum = z.enum(["GLOBAL", "INDUSTRY_SPECIFIC", "NATIONAL", "REGIONAL"]);

export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  issuing_organization_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  level: z.string().nullable(),
  category: CertificationCategoryEnum.nullable(),
  products: z.array(z.string()).nullable(),
  jobs: z.array(z.string()).nullable(),
  validity_duration_months: z.number().int().nullable(),
  difficulty: DifficultyLevelEnum.nullable(),
  cost: z.number().nullable(),
  cost_currency: z.string().nullable(),
  website_url: z.string().nullable(),
  logo_url: z.string().nullable(),
  recognition_level: RecognitionLevelEnum.nullable(),
  prerequisites: z.array(z.string()).nullable(),
  metadata: z.unknown().nullable(),  
  deleted_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateCertificationSchema = CertificationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateCertificationSchema = CreateCertificationSchema.partial();

export const GetCertificationsSchema = z.object({
  search: z.string().optional(),
  category: CertificationCategoryEnum.optional(),
  difficulty: DifficultyLevelEnum.optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;
export type CreateCertification = z.infer<typeof CreateCertificationSchema>;
export type UpdateCertification = z.infer<typeof UpdateCertificationSchema>;