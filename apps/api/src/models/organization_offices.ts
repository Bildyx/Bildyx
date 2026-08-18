import { z } from "zod";

export const OrganizationOfficeSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  city_id: z.uuid(),
  type: z.string().trim().min(1),
});

export const GetOrganizationOfficesSchema = z.object({
  city_id: z.uuid().optional(),
  type: z.string().optional(),
});

export const GetOrganizationOfficeSchema = z.object({
  organizationOfficeId: z.uuid(),
});

export const PostOrganizationOfficeSchema = OrganizationOfficeSchema.omit({
  id: true,
});

export const PutOrganizationOfficeSchema =
  PostOrganizationOfficeSchema.partial();

export const DeleteOrganizationOfficeSchema = z.object({
  organizationOfficeId: z.uuid(),
});

export const DeleteOrganizationOfficesBulkSchema = z.object({
  organizationOfficeIds: z.array(z.uuid()),
});

export type OrganizationOffice = z.infer<typeof OrganizationOfficeSchema>;
export type PostOrganizationOffice = z.infer<
  typeof PostOrganizationOfficeSchema
>;
export type PutOrganizationOffice = z.infer<typeof PutOrganizationOfficeSchema>;
