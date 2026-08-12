import { z } from "zod";

export const TeamPhotoSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable().optional(),
  url: z.string().min(1),
  team_id: z.uuid(),
});

export const GetTeamPhotosSchema = z.object({
  team_id: z.uuid().optional(),
});

export const GetTeamPhotoSchema = z.object({
  teamPhotoId: z.uuid(),
});

export const PostTeamPhotoSchema = TeamPhotoSchema.omit({
  id: true,
});

export const PutTeamPhotoSchema = PostTeamPhotoSchema.partial();

export const DeleteTeamPhotoSchema = z.object({
  teamPhotoId: z.uuid(),
});

export const DeleteTeamPhotosBulkSchema = z.object({
  teamPhotoIds: z.array(z.uuid()),
});

export type TeamPhoto = z.infer<typeof TeamPhotoSchema>;
export type PostTeamPhoto = z.infer<typeof PostTeamPhotoSchema>;
export type PutTeamPhoto = z.infer<typeof PutTeamPhotoSchema>;
