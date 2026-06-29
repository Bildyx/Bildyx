import { z } from "zod";

export const CertificationCategorySchema = z.enum([
  "TECHNICAL",
  "PROFESSIONAL",
  "PROJECTMANAGEMENT",
  "VENDORPRODUCT",
  "LANGUAGE",
  "OTHER",
]);

export const DifficultyLevelSchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

// Représentation de l'objet complet en base de données (aligné avec Kysely/PostgreSQL)
export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  issuing_organization_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  category: CertificationCategorySchema.nullable().optional(),
  difficulty: DifficultyLevelSchema.nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  jobs: z.array(z.string()).nullable().optional(),
  validity_duration_months: z.number().int().nullable().optional(),
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
  category: CertificationCategorySchema.optional(),
});

// Schéma pour la création (Body)
export const PostCertificationSchema = CertificationSchema.omit({
  id: true,
});
