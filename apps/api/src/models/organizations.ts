import { z } from "zod";
import { EmployeeCountRangeEnum, OrganizationTypeEnum } from "./utils/enums";

const arrayPreprocessor = z.preprocess((val) => {
  if (Array.isArray(val)) {
    const filtered = val.filter((v) => v !== "");
    return filtered.length === 0 ? null : filtered;
  }
  return val === "" ? null : val;
}, z.array(z.string()).nullable().optional());

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  type: OrganizationTypeEnum.nullable().optional(),
  category: z.string().nullable().optional(),
  legal_status: z.string().nullable().optional(),
  ownership: z.string().nullable().optional(),
  mission: z.string().nullable().optional(),
  known_for: arrayPreprocessor,
  activities: arrayPreprocessor,
  project: z.string().nullable().optional(),
  research_areas: arrayPreprocessor,
  products: arrayPreprocessor,
  services: arrayPreprocessor,
  partnerships: arrayPreprocessor,
  budget: z.string().nullable().optional(),
  founded: z.string().nullable().optional(),
  founder: z.string().nullable().optional(),
  equipments: z.string().nullable().optional(),
  score: z.number().int().min(0).nullable().optional(),
  numberOfEmployees: EmployeeCountRangeEnum.nullable().optional(),
  numberOfSubsidiaries: z.number().int().min(0).nullable().optional(),
  parent_organization_id: z.string().uuid().nullable().optional(),
  cityId: z.string().uuid().nullable().optional(),
  metadata: z.any().nullable().optional(),
  deleted_at: z
    .date()
    .nullable()
    .optional()
    .default(null as any),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  slug: true,
}).extend({
  slug: z.string().trim().min(1),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export const GetOrganizationsSchema = z.object({
  search: z.string().optional(),
  type: OrganizationTypeEnum.optional(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;
