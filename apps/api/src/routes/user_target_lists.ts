import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  UserTargetListSchema,
  PostUserTargetListSchema,
  GetUserTargetListsSchema,
  GetUserTargetListSchema,
  DeleteUserTargetListSchema,
  DeleteUserTargetListsBulkSchema,
} from "../models/user_target_lists";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const user_target_lists = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all user target list entries",
      description: "Get all user target list entries with optional filters",
      path: "/user-target-lists",
      tags: ["UserTargetList"],
    })
    .input(GetUserTargetListsSchema)
    .output(z.array(UserTargetListSchema))
    .handler(async ({ input }) => {
      const { user_profile_id, organization_id } = input;

      let query = database.selectFrom("user_target_lists");

      if (user_profile_id) {
        query = query.where("user_profile_id", "=", user_profile_id);
      }

      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
      }

      return await query.selectAll().orderBy("created_at", "desc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user target list entry",
      description: "Get a user target list entry by its ID",
      path: "/user-target-lists/{userTargetListId}",
      tags: ["UserTargetList"],
    })
    .input(GetUserTargetListSchema)
    .output(UserTargetListSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("user_target_lists")
        .where("id", "=", input.userTargetListId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", {
          message: "User target list entry not found",
        });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add an organization to a user's target list",
      description: "Add an organization to a user profile's target list",
      path: "/user-target-lists",
      tags: ["UserTargetList"],
    })
    .input(PostUserTargetListSchema)
    .output(UserTargetListSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("user_target_lists")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("organization_id", "=", input.organization_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This organization is already in the user's target list",
        });
      }

      const entry = await database
        .insertInto("user_target_lists")
        .values({
          ...input,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!entry) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to add organization to target list",
        });
      }

      return entry;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Remove an organization from a user's target list",
      description: "Remove a user target list entry by its ID",
      path: "/user-target-lists/{userTargetListId}",
      tags: ["UserTargetList"],
    })
    .input(DeleteUserTargetListSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("user_target_lists")
        .where("id", "=", input.userTargetListId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", {
          message: "User target list entry not found",
        });
      }

      await database
        .deleteFrom("user_target_lists")
        .where("id", "=", input.userTargetListId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Remove multiple entries from user target lists",
      description: "Remove multiple user target list entries by their IDs",
      path: "/user-target-lists",
      tags: ["UserTargetList"],
    })
    .input(DeleteUserTargetListsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("user_target_lists")
        .where("id", "in", input.userTargetListIds)
        .execute();
    }),
};
