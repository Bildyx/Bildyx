import { z } from "zod";
import { zNullableUUID } from "./utils/preprocessors";

export const UserTargetListSchema = z.object({
  id: z.uuid(),
  user_profile_id: z.uuid(),
  organization_id: z.uuid(),
});

// GET
export const GetUserTargetListsSchema = z.object({
  user_profile_id: zNullableUUID(),
  organization_id: zNullableUUID(),
});

export const GetUserTargetListSchema = z.object({
  userTargetListId: z.uuid(),
});

// POST
export const PostUserTargetListSchema = UserTargetListSchema.omit({
  id: true,
});

// DELETE
export const DeleteUserTargetListSchema = z.object({
  userTargetListId: z.uuid(),
});

export const DeleteUserTargetListsBulkSchema = z.object({
  userTargetListIds: z.array(z.uuid()),
});

export type UserTargetList = z.infer<typeof UserTargetListSchema>;
export type PostUserTargetList = z.infer<typeof PostUserTargetListSchema>;
