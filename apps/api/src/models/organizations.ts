import { z } from "zod";
import { EmployeeCountRangeEnum, OrganizationSubtypeEnum } from "./utils/enums";

export const OrganizationSchema = z.object({
  id: z.uuid(),
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
  budget: z.string().nullable().optional(),
  founded: z.string().nullable().optional(),
  founders: z.array(z.string()).nullable().optional(),
  collections: z.string().nullable().optional(),
  student_count: z.coerce.number().int().min(0).nullable().optional(),
  undergraduates: z.coerce.number().int().min(0).nullable().optional(),
  postgraduates: z.coerce.number().int().min(0).nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  members: z.number().int().min(0).nullable().optional(),
  personnel: z.number().int().min(0).nullable().optional(),
  numberOfEmployees: EmployeeCountRangeEnum.nullable().optional(),
  parent_organization_id: z.uuid().nullable().optional(),
  city_id: z.uuid().nullable().optional(),
  industry_id: z.uuid().nullable().optional(),
  website_url: z.string().nullable().optional(),
  research_areas: z.array(z.string()).nullable().optional(),
  products: z.array(z.string()).nullable().optional(),
  services: z.array(z.string()).nullable().optional(),
  facilities: z.array(z.string()).nullable().optional(),
  programs_activities: z.array(z.string()).nullable().optional(),
  profile_url: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_public: z.boolean().nullable().optional(),
});

// GET
export const GetOrganizationsSchema = z.object({
  name: z.string().optional(),
  subtypes: z
    .preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(OrganizationSubtypeEnum))
    .optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sizes: z
    .preprocess((val) => {
      if (typeof val === "string") return [val];
      return val;
    }, z.array(EmployeeCountRangeEnum))
    .optional(),
  keyword: z.string().optional(),
  productFilter: z.enum(["same", "similar", "different"]).optional(),
  userExperienceKeywords: z.array(z.string()).optional(),
});

export const GetOrganizationSchema = z.object({
  organizationId: z.uuid(),
});

// POST
export const PostOrganizationSchema = OrganizationSchema.omit({
  id: true,
});

// PATCH
export const PutOrganizationSchema = PostOrganizationSchema.partial();

// DELETE
export const DeleteOrganizationSchema = z.object({
  organizationId: z.uuid(),
});

export const DeleteOrganizationsBulkSchema = z.object({
  organizationIds: z.array(z.uuid()),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type PostOrganization = z.infer<typeof PostOrganizationSchema>;
export type PutOrganization = z.infer<typeof PutOrganizationSchema>;
