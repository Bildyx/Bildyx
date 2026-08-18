import { z } from "zod";

export const OrganizationCustomerSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  customer_id: z.uuid(),
});

export const GetOrganizationCustomersSchema = z.object({
  organization_id: z.uuid().optional(),
  customer_id: z.uuid().optional(),
});

export const GetOrganizationCustomerSchema = z.object({
  organizationCustomerId: z.uuid(),
});

export const PostOrganizationCustomerSchema = OrganizationCustomerSchema.omit({
  id: true,
});

export const PutOrganizationCustomerSchema =
  PostOrganizationCustomerSchema.partial();

export const DeleteOrganizationCustomerSchema = z.object({
  organizationCustomerId: z.uuid(),
});

export const DeleteOrganizationCustomersBulkSchema = z.object({
  organizationCustomerIds: z.array(z.uuid()),
});

export type OrganizationCustomer = z.infer<typeof OrganizationCustomerSchema>;
export type PostOrganizationCustomer = z.infer<
  typeof PostOrganizationCustomerSchema
>;
export type PutOrganizationCustomer = z.infer<
  typeof PutOrganizationCustomerSchema
>;
