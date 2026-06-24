import { z } from 'zod';

export const CertificationCategorySchema = z.enum([
  'PROFESSIONAL',
  'TECHNICAL',
  'QUALITY',
  'COMPLIANCE',
  'LANGUAGE',
  'SECURITY',
  'OTHER',
]);

// Représentation de l'objet complet en base de données
export const CertificationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serialNumber: z.string(),
  issuingOrganizationId: z.string().uuid(),
  description: z.string(),
  level: z.string(),
  category: CertificationCategorySchema,
  products: z.array(z.string()),
  jobs: z.array(z.string()),
  validityDurationMonths: z.number().int(),
  cost: z.number(),
  costCurrency: z.string(),
  websiteUrl: z.string(),
  logoUrl: z.string(),
  metadata: z.record(z.string(), z.any()),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schéma pour la validation du listing (Query params)
export const GetCertificationsSchema = z.object({
  companyId: z.string().uuid(),
  search: z.string().optional(),
  category: CertificationCategorySchema.optional(), // Filtre par catégorie optionnel
});

// Schéma pour la création (Body)
export const PostCertificationSchema = CertificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});