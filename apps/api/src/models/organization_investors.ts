import { z } from "zod";

export const OrganizationInvestorSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  investor_id: z.uuid(),
});

export const GetOrganizationInvestorsSchema = z.object({
  organization_id: z.uuid().optional(),
  investor_id: z.uuid().optional(),
});

export const GetOrganizationInvestorSchema = z.object({
  organizationInvestorId: z.uuid(),
});

export const PostOrganizationInvestorSchema = OrganizationInvestorSchema.omit({
  id: true,
});

export const PutOrganizationInvestorSchema =
  PostOrganizationInvestorSchema.partial();

export const DeleteOrganizationInvestorSchema = z.object({
  organizationInvestorId: z.uuid(),
});

export const DeleteOrganizationInvestorsBulkSchema = z.object({
  organizationInvestorIds: z.array(z.uuid()),
});

export type OrganizationInvestor = z.infer<typeof OrganizationInvestorSchema>;
export type PostOrganizationInvestor = z.infer<
  typeof PostOrganizationInvestorSchema
>;
export type PutOrganizationInvestor = z.infer<
  typeof PutOrganizationInvestorSchema
>;
