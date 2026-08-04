import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import {
  JobAdSchema,
  PostJobAdSchema,
  PutJobAdSchema,
  GetJobAdsSchema,
  GetJobAdSchema,
  DeleteJobAdSchema,
  DeleteJobAdsBulkSchema,
} from "../models/job_ads";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const job_ads = {
  getAll: publicProcedure
    .route({
      method: "GET",
      summary: "List all job ads",
      description: "Get all job ads with optional filters",
      path: "/job-ads",
      tags: ["JobAd"],
    })
    .input(GetJobAdsSchema)
    .output(z.array(JobAdSchema))
    .handler(async ({ input }) => {
      const {
        name,
        organization_id,
        job_id,
        contract_type,
        remote,
        status,
        country_id,
        city_id,
      } = input;

      let query = database
        .selectFrom("job_ads")
        .where("deleted_at", "is", null);

      if (name) {
        const p = `%${name.trim()}%`;
        query = query.where((eb) =>
          eb("title", "ilike", p).or("description", "ilike", p),
        );
      }

      if (organization_id) {
        query = query.where("organization_id", "=", organization_id);
      }
      if (job_id) {
        query = query.where("job_id", "=", job_id);
      }
      if (contract_type) {
        query = query.where("contract_type", "=", contract_type);
      }
      if (remote) {
        query = query.where("remote", "=", remote);
      }
      if (status) {
        query = query.where("status", "=", status);
      }
      if (country_id) {
        query = query.where("country_id", "=", country_id);
      }
      if (city_id) {
        query = query.where("city_id", "=", city_id);
      }

      return await query.selectAll().orderBy("created_at", "desc").execute();
    }),

  getById: publicProcedure
    .route({
      method: "GET",
      summary: "Get one job ad",
      description: "Get a job ad by its ID",
      path: "/job-ads/{jobAdId}",
      tags: ["JobAd"],
    })
    .input(GetJobAdSchema)
    .output(JobAdSchema)
    .handler(async ({ input }) => {
      const data = await database
        .selectFrom("job_ads")
        .where("id", "=", input.jobAdId)
        .where("deleted_at", "is", null)
        .selectAll()
        .executeTakeFirst();

      if (!data) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad not found" });
      }

      return data;
    }),

  create: publicProcedure
    .route({
      method: "POST",
      summary: "Create a job ad",
      description: "Create a new job ad",
      path: "/job-ads",
      tags: ["JobAd"],
    })
    .input(PostJobAdSchema)
    .output(JobAdSchema)
    .handler(async ({ input }) => {
      const { metadata, ...rest } = input;

      const job_ad = await database
        .insertInto("job_ads")
        .values({
          ...rest,
          id: randomUUID(),
          updated_at: new Date(),
          metadata: metadata as any,
        })
        .returningAll()
        .executeTakeFirst();

      if (!job_ad) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create job ad",
        });
      }

      return job_ad;
    }),

  update: publicProcedure
    .route({
      method: "PATCH",
      summary: "Update a job ad",
      description: "Update an existing job ad by its ID",
      path: "/job-ads/{jobAdId}",
      tags: ["JobAd"],
    })
    .input(z.object({ jobAdId: z.uuid() }).merge(PutJobAdSchema))
    .output(JobAdSchema)
    .handler(async ({ input }) => {
      const { jobAdId, metadata, ...rest } = input;

      const existing = await database
        .selectFrom("job_ads")
        .where("id", "=", jobAdId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad not found" });
      }

      const job_ad = await database
        .updateTable("job_ads")
        .set({ ...rest, updated_at: new Date(), metadata: metadata as any })
        .where("id", "=", jobAdId)
        .returningAll()
        .executeTakeFirst();

      if (!job_ad) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to update job ad",
        });
      }

      return job_ad;
    }),

  delete: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete a job ad",
      description: "Soft delete a job ad by its ID",
      path: "/job-ads/{jobAdId}",
      tags: ["JobAd"],
    })
    .input(DeleteJobAdSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      const existing = await database
        .selectFrom("job_ads")
        .where("id", "=", input.jobAdId)
        .where("deleted_at", "is", null)
        .select("id")
        .executeTakeFirst();

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Job ad not found" });
      }

      await database
        .updateTable("job_ads")
        .set({ deleted_at: new Date() })
        .where("id", "=", input.jobAdId)
        .execute();
    }),

  deleteBulk: publicProcedure
    .route({
      method: "DELETE",
      summary: "Delete multiple job ads",
      description: "Soft delete multiple existing job ads by their IDs",
      path: "/job-ads",
      tags: ["JobAd"],
    })
    .input(DeleteJobAdsBulkSchema)
    .output(z.void())
    .handler(async ({ input }) => {
      await database
        .updateTable("job_ads")
        .set({ deleted_at: new Date() })
        .where("id", "in", input.jobAdIds)
        .execute();
    }),
};
