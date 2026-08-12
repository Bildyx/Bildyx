import { z } from "zod";

export const TeamOfficeSchema = z.object({
  id: z.uuid(),
  city_id: z.uuid(),
  type: z.string().trim().min(1),
});

export const GetTeamOfficesSchema = z.object({
  city_id: z.uuid().optional(),
  type: z.string().optional(),
});

export const GetTeamOfficeSchema = z.object({
  teamOfficeId: z.uuid(),
});

export const PostTeamOfficeSchema = TeamOfficeSchema.omit({
  id: true,
});

export const PutTeamOfficeSchema = PostTeamOfficeSchema.partial();

export const DeleteTeamOfficeSchema = z.object({
  teamOfficeId: z.uuid(),
});

export const DeleteTeamOfficesBulkSchema = z.object({
  teamOfficeIds: z.array(z.uuid()),
});

export type TeamOffice = z.infer<typeof TeamOfficeSchema>;
export type PostTeamOffice = z.infer<typeof PostTeamOfficeSchema>;
export type PutTeamOffice = z.infer<typeof PutTeamOfficeSchema>;
