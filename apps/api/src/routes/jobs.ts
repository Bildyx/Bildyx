import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { JobSchema, CreateJobSchema, UpdateJobSchema, GetJobsSchema } from "../models/jobs";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const jobs = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all jobs",
      description: "Get all jobs with optional filters",
      path: "/jobs",
      tags: ["Job"]
    })
    .input(GetJobsSchema)
    .output(z.array(JobSchema))
    .handler(async ({ input }) => {
      const { search, category, seniority_level, industry_id, country_id } = input;

      let query = database.selectFrom('jobs').where('deleted_at', 'is', null);

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) =>
          eb('title', 'ilike', p).or('description', 'ilike', p)
        );
      }

      if (category) query = query.where('category', '=', category);
      if (seniority_level) query = query.where('seniority_level', '=', seniority_level);
      if (industry_id) query = query.where('industry_id', '=', industry_id);
      if (country_id) query = query.where('country_id', '=', country_id);

      return await query
        .selectAll()
        .orderBy('title', 'asc')
        .execute();
    }),

  getOne: publicProcedure
    .route({
      method: "GET",
      summary: "Get one job",
      description: "Get a job by its ID",
      path: "/jobs/{jobId}",
      tags: ["Job"]
    })
    .input(z.object({ jobId: z.string().uuid() }))
    .output(JobSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom('jobs')
        .where('id', '=', input.jobId)
        .where('deleted_at', 'is', null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Job not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a job",
      description: "Create a new job",
      path: "/jobs",
      tags: ["Job"]
    })
    .input(CreateJobSchema)
    .output(JobSchema)
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('jobs')
        .where('title', 'ilike', input.title)
        .$if(!!input.industry_id, (qb) => qb.where('industry_id', '=', input.industry_id!))
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (existing) {
        throw new ORPCError("CONFLICT", { message: "A job with this title already exists for this industry" });
      }

      const { metadata, ...rest } = input;

      const job = await database
        .insertInto('jobs')
        .values({
          ...rest,
          id: uuidv4(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!job) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create job" });
      }

      return job;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a job",
      description: "Update an existing job by its ID",
      path: "/jobs/{jobId}",
      tags: ["Job"]
    })
    .input(z.object({ jobId: z.string().uuid() }).merge(UpdateJobSchema))
    .output(JobSchema)
    .handler(async ({ input }) => {
      const { jobId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom('jobs')
        .where('id', '=', jobId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job not found" });
      }

      const job = await database
        .updateTable('jobs')
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where('id', '=', jobId)
        .returningAll()
        .executeTakeFirst();

      if (!job) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update job" });
      }

      return job;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a job",
      description: "Soft delete a job by its ID",
      path: "/jobs/{jobId}",
      tags: ["Job"]
    })
    .input(z.object({ jobId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom('jobs')
        .where('id', '=', input.jobId)
        .where('deleted_at', 'is', null)
        .select('id')
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job not found" });
      }

      await database
        .updateTable('jobs')
        .set({ deleted_at: new Date() })
        .where('id', '=', input.jobId)
        .execute();

      return { success: true };
    }),
};