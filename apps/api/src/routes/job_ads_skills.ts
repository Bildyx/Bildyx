import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { JobAdSkillSchema, CreateJobAdSkillSchema, UpdateJobAdSkillSchema, GetJobAdSkillsSchema } from "../models/job_ad_skills";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const job_ads_skills = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all job ad skills",
      description: "Get all job ad skills with optional filters",
      path: "/job-ad-skills",
      tags: ["JobAdSkill"],
    })
    .input(GetJobAdSkillsSchema)
    .output(z.array(JobAdSkillSchema))
    .handler(async ({ input }) => {
      const { job_ad_id, skill_id, importance } = input;

      let query = database.selectFrom("job_ad_skills");

      if (job_ad_id) {
        query = query.where("job_ad_id", "=", job_ad_id);
      }
      if (skill_id) {
        query = query.where("skill_id", "=", skill_id);
      }
      if (importance) {
        query = query.where("importance", "=", importance);
      }

      return await query.selectAll().execute();
    }),

  getByJobAd: publicProcedure
    .route({
      method: "GET",
      summary: "Get skills for a job ad",
      description: "Get all skills for a specific job ad",
      path: "/job-ads/{jobAdId}/skills",
      tags: ["JobAdSkill"],
    })
    .input(z.object({ jobAdId: z.string().uuid() }))
    .output(z.array(JobAdSkillSchema))
    .handler(async ({ input }) => {
      const jobAd = await database
        .selectFrom("job_ads")
        .where("id", "=", input.jobAdId)
        .select("id")
        .executeTakeFirst();

      if (!jobAd) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad not found" });
      }

      return await database
        .selectFrom("job_ad_skills")
        .where("job_ad_id", "=", input.jobAdId)
        .selectAll()
        .execute();
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Add a skill to a job ad",
      description: "Add a skill to a job ad",
      path: "/job-ad-skills",
      tags: ["JobAdSkill"],
    })
    .input(CreateJobAdSkillSchema)
    .output(JobAdSkillSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("job_ad_skills")
        .where("job_ad_id", "=", input.job_ad_id)
        .where("skill_id", "=", input.skill_id)
        .select("id")
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "This skill is already added to this job ad",
        });
      }

      const job_ad_skill = await database
        .insertInto("job_ad_skills")
        .values({ ...input, id: randomUUID() })
        .returningAll()
        .executeTakeFirst();

      if (!job_ad_skill) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to add skill to job ad",
        });
      }

      return job_ad_skill;
    }),

  update: publicProcedure
    .route({
      method: "PUT",
      summary: "Update a job ad skill",
      description: "Update the importance of a skill for a job ad",
      path: "/job-ad-skills/{jobAdSkillId}",
      tags: ["JobAdSkill"],
    })
    .input(
      z.object({ jobAdSkillId: z.string().uuid() }).merge(UpdateJobAdSkillSchema),
    )
    .output(JobAdSkillSchema)
    .handler(async ({ input }) => {
      const { jobAdSkillId, ...rest } = input;

      const existing = await database
        .selectFrom("job_ad_skills")
        .where("id", "=", jobAdSkillId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad skill not found" });
      }

      const job_ad_skill = await database
        .updateTable("job_ad_skills")
        .set(rest)
        .where("id", "=", jobAdSkillId)
        .returningAll()
        .executeTakeFirst();

      if (!job_ad_skill) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update job ad skill",
        });
      }

      return job_ad_skill;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Remove a skill from a job ad",
      description: "Remove a skill from a job ad",
      path: "/job-ad-skills/{jobAdSkillId}",
      tags: ["JobAdSkill"],
    })
    .input(z.object({ jobAdSkillId: z.string().uuid() }))
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("job_ad_skills")
        .where("id", "=", input.jobAdSkillId)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad skill not found" });
      }

      await database
        .deleteFrom("job_ad_skills")
        .where("id", "=", input.jobAdSkillId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Remove multiple skills from job ads",
      description: "Remove multiple skills from job ads by their IDs",
      path: "/job-ad-skills/bulk",
      tags: ["JobAdSkill"],
    })
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .deleteFrom("job_ad_skills")
        .where("id", "in", input.ids)
        .execute();
    }),
};