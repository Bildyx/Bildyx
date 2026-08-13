import { z } from "zod";

export const OrganizationPartnerSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  partner_id: z.uuid(),
});

export const GetOrganizationPartnersSchema = z.object({
  organization_id: z.uuid().optional(),
  partner_id: z.uuid().optional(),
});

export const GetOrganizationPartnerSchema = z.object({
  organizationPartnerId: z.uuid(),
});

export const PostOrganizationPartnerSchema = OrganizationPartnerSchema.omit({
  id: true,
});

export const PutOrganizationPartnerSchema =
  PostOrganizationPartnerSchema.partial();

export const DeleteOrganizationPartnerSchema = z.object({
  organizationPartnerId: z.uuid(),
});

export const DeleteOrganizationPartnersBulkSchema = z.object({
  organizationPartnerIds: z.array(z.uuid()),
});

export type OrganizationPartner = z.infer<typeof OrganizationPartnerSchema>;
export type PostOrganizationPartner = z.infer<
  typeof PostOrganizationPartnerSchema
>;
export type PutOrganizationPartner = z.infer<
  typeof PutOrganizationPartnerSchema
>;
