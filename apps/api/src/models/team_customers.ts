import { z } from "zod";

export const TeamCustomerSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
});

export const GetTeamCustomersSchema = z.object({
  team_id: z.uuid().optional(),
  organization_id: z.uuid().optional(),
});

export const GetTeamCustomerSchema = z.object({
  teamCustomerId: z.uuid(),
});

export const PostTeamCustomerSchema = TeamCustomerSchema.omit({
  id: true,
});

export const PutTeamCustomerSchema = PostTeamCustomerSchema.partial();

export const DeleteTeamCustomerSchema = z.object({
  teamCustomerId: z.uuid(),
});

export const DeleteTeamCustomersBulkSchema = z.object({
  teamCustomerIds: z.array(z.uuid()),
});

export type TeamCustomer = z.infer<typeof TeamCustomerSchema>;
export type PostTeamCustomer = z.infer<typeof PostTeamCustomerSchema>;
export type PutTeamCustomer = z.infer<typeof PutTeamCustomerSchema>;
