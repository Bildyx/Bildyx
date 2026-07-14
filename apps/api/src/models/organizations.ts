import { z } from "zod";
import { EmployeeCountRangeEnum, OrganizationTypeEnum } from "./utils/enums";
import { zStringArray } from "./utils/preprocessors";

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  type: OrganizationTypeEnum.nullable().optional(),
  legal_status: z.string().nullable().optional(),
  ownership: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  known_for: zStringArray(),
  activities: zStringArray(),
  project: z.string().nullable().optional(),
  research_areas: zStringArray(),
  products: zStringArray(),
  services: zStringArray(),
  partnerships: zStringArray(),
  budget: z.string().nullable().optional(),
  founded: z.string().nullable().optional(),
  founder: z.string().nullable().optional(),
  equipments: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  numberOfEmployees: EmployeeCountRangeEnum.nullable().optional(),
  numberOfSubsidiaries: z.number().int().min(0).nullable().optional(),
  parent_organization_id: z.string().uuid().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
  city_id: z.string().uuid().nullable().optional(),
});

// GET
export const GetOrganizationsSchema = z.object({
  name: z.string().optional(),
  type: OrganizationTypeEnum.optional(),
});

export const GetOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

// POST
export const PostOrganizationSchema = OrganizationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

// PATCH
export const PutOrganizationSchema = PostOrganizationSchema.partial();

// DELETE
export const DeleteOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
});

export const DeleteOrganizationsBulkSchema = z.object({
  organizationIds: z.array(z.string().uuid()),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type PostOrganization = z.infer<typeof PostOrganizationSchema>;
export type PutOrganization = z.infer<typeof PutOrganizationSchema>;
