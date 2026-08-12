import { z } from "zod";

export const TeamPartnerSchema = z.object({
  id: z.uuid(),
  team_id: z.uuid().nullable().optional(),
  organization_id: z.uuid().nullable().optional(),
});

export const GetTeamPartnersSchema = z.object({
  team_id: z.uuid().optional(),
  organization_id: z.uuid().optional(),
});

export const GetTeamPartnerSchema = z.object({
  teamPartnerId: z.uuid(),
});

export const PostTeamPartnerSchema = TeamPartnerSchema.omit({
  id: true,
});

export const PutTeamPartnerSchema = PostTeamPartnerSchema.partial();

export const DeleteTeamPartnerSchema = z.object({
  teamPartnerId: z.uuid(),
});

export const DeleteTeamPartnersBulkSchema = z.object({
  teamPartnerIds: z.array(z.uuid()),
});

export type TeamPartner = z.infer<typeof TeamPartnerSchema>;
export type PostTeamPartner = z.infer<typeof PostTeamPartnerSchema>;
export type PutTeamPartner = z.infer<typeof PutTeamPartnerSchema>;
