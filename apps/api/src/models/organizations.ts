import { z } from "zod";
import { EmployeeCountRangeEnum, OrganizationSubtypeEnum } from "./utils/enums";

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  serial_number: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  subtype: OrganizationSubtypeEnum.nullable().optional(),
  type1: z.string().nullable().optional(),
  type2: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  authority: z.string().nullable().optional(),
  ownership: z.string().nullable().optional(),
  jurisdiction: z.string().nullable().optional(),
  known_for: z.string().nullable().optional(),
  project: z.string().nullable().optional(),
  budget: z.string().nullable().optional(),
  founded: z.string().nullable().optional(),
  founders: z.array(z.string()).nullable().optional(),
  collections: z.string().nullable().optional(),
  graduates: z.string().nullable().optional(),
  undergraduates: z.string().nullable().optional(),
  subsidiaries: z.string().nullable().optional(),
  offices: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  members: z.number().int().min(0).nullable().optional(),
  personnel: z.number().int().min(0).nullable().optional(),
  numberOfEmployees: EmployeeCountRangeEnum.nullable().optional(),
  parent_organization_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  research_areas: z.array(z.string()).nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  services: z.array(z.string()).nullable().optional(),
  facilities: z.array(z.string()).nullable().optional(),
  partners: z.array(z.string()).nullable().optional(),
  programs_activities: z.array(z.string()).nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z.date().nullable().optional().default(null),
  created_at: z.date(),
  updated_at: z.date(),
});

// GET
export const GetOrganizationsSchema = z.object({
  name: z.string().optional(),
  subtype: OrganizationSubtypeEnum.optional(),
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
