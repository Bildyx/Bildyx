import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  SkillSchema,
  PostSkillSchema,
  PutSkillSchema,
  GetSkillsSchema,
  GetSkillSchema,
  DeleteSkillSchema,
  DeleteSkillsBulkSchema,
} from "../models/skills";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const skills = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all skills",
      description: "Get all skills with optional filters",
      path: "/skills",
      tags: ["Skill"],
    })
    .input(GetSkillsSchema)
    .output(z.array(SkillSchema))
    .handler(async ({ input }) => {
      const { name, category, difficulty } = input;

      let query = database.selectFrom("skills");

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("name", "ilike", p).or("description", "ilike", p),
        );
      }

      if (category) {
        query = query.where("category", "=", category);
      }
      if (difficulty) {
        query = query.where("difficulty", "=", difficulty);
      }

      return (await query.selectAll().orderBy("name", "asc").execute()) as any;
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one skill",
      description: "Get a skill by its ID",
      path: "/skills/{skillId}",
      tags: ["Skill"],
    })
    .input(GetSkillSchema)
    .output(SkillSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("skills")
        .where("id", "=", input.skillId)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
      }

      return data as any;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a skill",
      description: "Create a new skill",
      path: "/skills",
      tags: ["Skill"],
    })
    .input(PostSkillSchema)
    .output(SkillSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("skills")
        .where("name", "ilike", input.name)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "A skill with this name already exists",
        });
      }

      const { ...rest } = input;

      const skill = await database
        .insertInto("skills")
        .values({
          ...rest,
          id: randomUUID(),
        })
        .returningAll()
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create skill",
        });
      }

      return skill as any;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a skill",
      description: "Update an existing skill by its ID",
      path: "/skills/{skillId}",
      tags: ["Skill"],
    })
    .input(z.object({ skillId: z.uuid() }).merge(PutSkillSchema))
    .output(SkillSchema)
    .handler(async ({ input }) => {
      const { skillId, ...rest } = input;

      const existing = await database
        .selectFrom("skills")
        .where("id", "=", skillId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
      }

      const skill = await database
        .updateTable("skills")
        .set({ ...rest })
        .where("id", "=", skillId)
        .returningAll()
        .executeTakeFirst();

      if (!skill) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update skill",
        });
      }

      return skill as any;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a skill",
      description: "Soft delete a skill by its ID",
      path: "/skills/{skillId}",
      tags: ["Skill"],
    })
    .input(DeleteSkillSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("skills")
        .where("id", "=", input.skillId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
      }

      await database
        .deleteFrom("skills")
        .where("id", "=", input.skillId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple skills",
      description: "Soft delete multiple existing skills by their IDs",
      path: "/skills",
      tags: ["Skill"],
    })
    .input(DeleteSkillsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("skills")
        .where("id", "in", input.skillIds)
        .execute();
    }),
};
