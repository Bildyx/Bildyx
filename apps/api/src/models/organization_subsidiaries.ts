import { z } from "zod";

export const OrganizationSubsidiarySchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  subsidiary_id: z.uuid(),
});

export const GetOrganizationSubsidiariesSchema = z.object({
  organization_id: z.uuid().optional(),
  subsidiary_id: z.uuid().optional(),
});

export const GetOrganizationSubsidiarySchema = z.object({
  organizationSubsidiaryId: z.uuid(),
});

export const PostOrganizationSubsidiarySchema =
  OrganizationSubsidiarySchema.omit({
    id: true,
  });

export const PutOrganizationSubsidiarySchema =
  PostOrganizationSubsidiarySchema.partial();

export const DeleteOrganizationSubsidiarySchema = z.object({
  organizationSubsidiaryId: z.uuid(),
});

export const DeleteOrganizationSubsidiariesBulkSchema = z.object({
  organizationSubsidiaryIds: z.array(z.uuid()),
});

export type OrganizationSubsidiary = z.infer<
  typeof OrganizationSubsidiarySchema
>;
export type PostOrganizationSubsidiary = z.infer<
  typeof PostOrganizationSubsidiarySchema
>;
export type PutOrganizationSubsidiary = z.infer<
  typeof PutOrganizationSubsidiarySchema
>;
