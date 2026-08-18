import { z } from "zod";

export const OrganizationPhotoSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  name: z.string().nullable().optional(),
  url: z.string().min(1),
});

export const GetOrganizationPhotosSchema = z.object({
  organization_id: z.uuid().optional(),
});

export const GetOrganizationPhotoSchema = z.object({
  organizationPhotoId: z.uuid(),
});

export const PostOrganizationPhotoSchema = OrganizationPhotoSchema.omit({
  id: true,
});

export const PutOrganizationPhotoSchema = PostOrganizationPhotoSchema.partial();

export const DeleteOrganizationPhotoSchema = z.object({
  organizationPhotoId: z.uuid(),
});

export const DeleteOrganizationPhotosBulkSchema = z.object({
  organizationPhotoIds: z.array(z.uuid()),
});

export type OrganizationPhoto = z.infer<typeof OrganizationPhotoSchema>;
export type PostOrganizationPhoto = z.infer<typeof PostOrganizationPhotoSchema>;
export type PutOrganizationPhoto = z.infer<typeof PutOrganizationPhotoSchema>;
