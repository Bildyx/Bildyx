import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { job_ads } from "../routes/job_ads";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Job Ads API Endpoints", () => {
  let testOrgId: string;
  let testJobId: string;
  let createdJobAdId1: string;
  let createdJobAdId2: string;

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  before(async () => {
    // If running in test environment, initialize the database schema in memory
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);
    }

    testOrgId = randomUUID();
    testJobId = randomUUID();

    // Insert mock organization
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId,
        name: "Test Org for Job Ads",
        slug: "test-org-job-ads-slug",
        updated_at: new Date(),
      })
      .execute();

    // Insert mock job
    await database
      .insertInto("jobs")
      .values({
        id: testJobId,
        title: "Test Job for Ads",
        serialNumber: "JOB-AD-TEST-01",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test items
    try {
      if (testJobId) {
        await database.deleteFrom("jobs").where("id", "=", testJobId).execute();
      }
      if (testOrgId) {
        await database.deleteFrom("organizations").where("id", "=", testOrgId).execute();
      }
      // Hard delete any remaining job ads created in tests
      await database.deleteFrom("job_ads").execute();
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /job-ads (Create)", () => {
    test("should throw ZodError when title is empty or missing", async () => {
      await assert.rejects(
        callProcedure(job_ads.create, {
          title: "",
          serialNumber: "JAD-CREATE-01",
          organization_id: testOrgId,
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should throw ZodError when serialNumber is empty or missing", async () => {
      await assert.rejects(
        callProcedure(job_ads.create, {
          title: "Senior Node.js Developer",
          serialNumber: "  ",
          organization_id: testOrgId,
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should successfully create a job ad in draft status", async () => {
      const result = await callProcedure(job_ads.create, {
        title: "Senior Node.js Developer",
        serialNumber: "JAD-CREATE-01",
        organization_id: testOrgId,
        job_id: testJobId,
        description: "Looking for an expert developer",
        contract_type: "FULL_TIME",
        remote: "HYBRID",
        salary_range: "$80k - $100k",
        required_years_experience: 5,
        required_education_level: "BACHELOR",
        tags: ["Node", "TypeScript"],
      });

      assert.ok(result.id);
      assert.strictEqual(result.title, "Senior Node.js Developer");
      assert.strictEqual(result.serialNumber, "JAD-CREATE-01");
      assert.strictEqual(result.organization_id, testOrgId);
      assert.strictEqual(result.status, "DRAFT");
      assert.strictEqual(result.contract_type, "FULL_TIME");
      assert.strictEqual(result.remote, "HYBRID");
      createdJobAdId1 = result.id;
    });

    test("should successfully create a second job ad", async () => {
      const result = await callProcedure(job_ads.create, {
        title: "Junior Backend Developer",
        serialNumber: "JAD-CREATE-02",
        organization_id: testOrgId,
        contract_type: "INTERNSHIP",
        remote: "FULL_REMOTE",
      });

      assert.ok(result.id);
      assert.strictEqual(result.status, "DRAFT");
      createdJobAdId2 = result.id;
    });
  });

  describe("GET /job-ads (GetAll)", () => {
    test("should successfully list all non-deleted job ads", async () => {
      const results = await callProcedure(job_ads.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should successfully search job ads by title query", async () => {
      const results = await callProcedure(job_ads.getAll, {
        search: "Node.js",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdJobAdId1);
    });

    test("should filter job ads by contract_type", async () => {
      const results = await callProcedure(job_ads.getAll, {
        contract_type: "INTERNSHIP",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdJobAdId2);
    });
  });

  describe("GET /job-ads/{jobAdId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(job_ads.getById, {
          jobAdId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully return the job ad by its ID", async () => {
      const result = await callProcedure(job_ads.getById, {
        jobAdId: createdJobAdId1,
      });

      assert.strictEqual(result.id, createdJobAdId1);
      assert.strictEqual(result.title, "Senior Node.js Developer");
    });
  });

  describe("PUT /job-ads/{jobAdId} (Update)", () => {
    test("should successfully update job ad fields", async () => {
      const result = await callProcedure(job_ads.update, {
        jobAdId: createdJobAdId1,
        title: "Staff Node.js Developer",
        required_years_experience: 8,
      });

      assert.strictEqual(result.id, createdJobAdId1);
      assert.strictEqual(result.title, "Staff Node.js Developer");
      assert.strictEqual(result.required_years_experience, 8);
    });
  });

  describe("PATCH /job-ads/{jobAdId}/publish & close (Workflow)", () => {
    test("should successfully publish a job ad", async () => {
      const result = await callProcedure(job_ads.publish, {
        jobAdId: createdJobAdId1,
      });

      assert.strictEqual(result.status, "PUBLISHED");
      assert.ok(result.published_at);
    });

    test("should successfully close a job ad", async () => {
      const result = await callProcedure(job_ads.close, {
        jobAdId: createdJobAdId1,
      });

      assert.strictEqual(result.status, "CLOSED");
    });
  });

  describe("DELETE /job-ads/{jobAdId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(job_ads.delete, {
          jobAdId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully soft delete a job ad", async () => {
      await callProcedure(job_ads.delete, {
        jobAdId: createdJobAdId2,
      });

      // Verify that it is no longer returned in getById
      await assert.rejects(
        callProcedure(job_ads.getById, {
          jobAdId: createdJobAdId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );

      // Verify that it is no longer returned in getAll
      const results = await callProcedure(job_ads.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdJobAdId2));

      createdJobAdId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /job-ads/bulk (DeleteBulk)", () => {
    test("should successfully bulk soft delete job ads", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(job_ads.create, {
        title: "Temporary Ad to delete",
        serialNumber: "JAD-BULK-DEL",
        organization_id: testOrgId,
      });

      const idsToDelete = [createdJobAdId1, extra.id];

      await callProcedure(job_ads.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(job_ads.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdJobAdId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdJobAdId1 = ""; // Mark as cleaned up
    });
  });
});
