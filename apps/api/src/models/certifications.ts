import { z } from "zod";
import { CertificationCategoryEnum, DifficultyLevelEnum } from "./utils/enums";

// Représentation de l'objet complet en base de données (aligné avec Kysely/PostgreSQL)
export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string().nullable().optional(),
  issuing_organization_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: CertificationCategoryEnum.nullable().optional(),
  difficulty: DifficultyLevelEnum.nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  jobs: z.array(z.string()).nullable().optional(),
  validity_duration_months: z.number().int().min(0).nullable().optional(),
  website_url: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export type Certification = z.infer<typeof CertificationSchema>;

// Schéma pour la validation du listing (Query params)
export const GetCertificationsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().optional(),
  category: CertificationCategoryEnum.optional(),
});

// Schéma pour la création (Body) : Enforce serialNumber to be a required string on creation
export const PostCertificationSchema = CertificationSchema.omit({
  id: true,
  serialNumber: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).extend({
  serialNumber: z.string(),
});
