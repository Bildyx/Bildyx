import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  GetUserSkillsSchema,
  GetUserSkillSchema,
  UserSkillSchema,
  PostUserSkillSchema,
  PutUserSkillSchema,
  DeleteUserSkillSchema,
  DeleteUserSkillsBulkSchema,
} from "../models/user_skills";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { Insertable } from "kysely";
import type { UserSkills } from "../db/types";

export const user_skills = {
  // 1. Get all skills of a profile
  getSkillsByProfile: publicProcedure
    .route({
      method: "GET",
      summary: "List all skills for a user profile",
      description: "Get all skills linked to a specific user profile",
      path: "/profiles/{userProfileId}/skills",
      tags: ["UserSkill"],
    })
    .input(GetUserSkillsSchema)
    .output(z.array(UserSkillSchema))
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.userProfileId)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      return (await database
        .selectFrom("user_skills")
        .innerJoin("skills", "skills.id", "user_skills.skill_id")
        .select([
          "user_skills.id as id",
          "user_skills.user_profile_id as user_profile_id",
          "user_skills.skill_id as skill_id",
          "user_skills.level as level",
          "skills.name as name",
        ])
        .where("user_profile_id", "=", input.userProfileId)
        .execute()) as any;
    }),

  // 2. Get a user skill by ID
  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get a specific user skill",
      description: "Get a specific user skill by its unique ID",
      path: "/user-skills/{userSkillId}",
      tags: ["UserSkill"],
    })
    .input(GetUserSkillSchema)
    .output(UserSkillSchema)
    .handler(async ({ input }) => {
      const skill = await database
        .selectFrom("user_skills")
        .selectAll()
        .where("id", "=", input.userSkillId)
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("NOT_FOUND", {
          message: "User skill not found",
        });
      }

      return skill;
    }),

  // 3. Add a skill to a profile
  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add a skill to a user profile",
      description: "Link a skill to a specific user profile",
      path: "/user-skills",
      tags: ["UserSkill"],
    })
    .input(PostUserSkillSchema)
    .output(UserSkillSchema)
    .handler(async ({ input }) => {
      const profile = await database
        .selectFrom("user_profiles")
        .where("id", "=", input.user_profile_id)
        .select("id")
        .executeTakeFirst();

      if (!profile) {
        throw new ORPCError("NOT_FOUND", { message: "User profile not found" });
      }

      const existing = await database
        .selectFrom("user_skills")
        .where("user_profile_id", "=", input.user_profile_id)
        .where("skill_id", "=", input.skill_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This skill is already linked to this profile",
        });
      }

      const skill = await database
        .insertInto("user_skills")
        .values({
          id: randomUUID(),
          ...input,
        } as Insertable<UserSkills>)
        .returningAll()
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create user skill",
        });
      }

      return skill;
    }),

  // 4. Update a user skill
  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a user skill",
      description: "Update level of an existing user skill by its ID",
      path: "/user-skills/{userSkillId}",
      tags: ["UserSkill"],
    })
    .input(z.object({ userSkillId: z.uuid() }).merge(PutUserSkillSchema))
    .output(UserSkillSchema)
    .handler(async ({ input }) => {
      const { userSkillId, ...updates } = input;

      const skill = await database
        .updateTable("user_skills")
        .set(updates as Insertable<UserSkills>)
        .where("id", "=", userSkillId)
        .returningAll()
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("NOT_FOUND", {
          message: "User skill not found",
        });
      }

      return skill;
    }),

  // 5. Supprimer une skill utilisateur
  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a user skill",
      description: "Delete an existing user skill by its ID",
      path: "/user-skills/{userSkillId}",
      tags: ["UserSkill"],
    })
    .input(DeleteUserSkillSchema)
    .output(UserSkillSchema)
    .handler(async ({ input }) => {
      const skill = await database
        .deleteFrom("user_skills")
        .where("id", "=", input.userSkillId)
        .returningAll()
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("NOT_FOUND", {
          message: "User skill not found",
        });
      }

      return skill;
    }),

  // 6. Supprimer plusieurs skills utilisateur (Bulk)
  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple user skills",
      description: "Delete multiple user skills by their IDs",
      path: "/user-skills",
      tags: ["UserSkill"],
    })
    .input(DeleteUserSkillsBulkSchema)
    .output(z.array(UserSkillSchema))
    .handler(async ({ input }) => {
      const { userSkillIds } = input;

      if (userSkillIds.length === 0) return [];

      return await database
        .deleteFrom("user_skills")
        .where("id", "in", userSkillIds)
        .returningAll()
        .execute();
    }),
};
