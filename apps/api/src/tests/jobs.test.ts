import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { jobs } from "../routes/jobs";
import { countries } from "../routes/countries";
import { industries } from "../routes/industries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Jobs API Endpoints", () => {
  let testCountryId: string;
  let testIndustryId: string;
  let createdJobId1: string;
  let createdJobId2: string;

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

    // Create a mock country
    const country = await callProcedure(countries.create, {
      name: "Job Test Country",
      serial_number: "JTC-01",
      iso_code: "JT",
    });
    testCountryId = country.id;

    // Create a mock industry
    const industry = await callProcedure(industries.create, {
      name: "Job Test Industry",
      serial_number: "JTI-01",
      description: "Industry for Job tests",
    });
    testIndustryId = industry.id;
  });

  after(async () => {
    // Clean up test jobs, industry, and country
    try {
      const jobIds = [createdJobId1, createdJobId2].filter(Boolean);
      if (jobIds.length > 0) {
        await database.deleteFrom("jobs").where("id", "in", jobIds).execute();
      }
      if (testIndustryId) {
        await database
          .deleteFrom("industries")
          .where("id", "=", testIndustryId)
          .execute();
      }
      if (testCountryId) {
        await database
          .deleteFrom("countries")
          .where("id", "=", testCountryId)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /jobs (Create)", () => {
    test("should throw ZodError when title is missing or empty", async () => {
      await assert.rejects(
        callProcedure(jobs.create, {
          title: "",
          serial_number: "JOB-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is missing or empty", async () => {
      await assert.rejects(
        callProcedure(jobs.create, {
          title: "Fullstack Developer",
          serial_number: "",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a job", async () => {
      const result = await callProcedure(jobs.create, {
        title: "Fullstack Developer",
        serial_number: "JOB-01",
        category: "PRIVATE_SECTOR",
        description: "Develop web applications",
        seniority_level: "SENIOR",
        is_elected: false,
        is_regulated: false,
        start_year: 2026,
        industry_id: testIndustryId,
        country_id: testCountryId,
        products: ["Vite", "React"],
        tools_and_tech: ["TypeScript", "Kysely"],
        tags: ["remote", "web"],
      });

      assert.ok(result.id);
      assert.strictEqual(result.title, "Fullstack Developer");
      assert.strictEqual(result.serial_number, "JOB-01");
      assert.strictEqual(result.industry_id, testIndustryId);
      createdJobId1 = result.id;
    });

    test("should throw CONFLICT when creating a job with an existing title for the same industry", async () => {
      await assert.rejects(
        callProcedure(jobs.create, {
          title: "Fullstack Developer",
          serial_number: "JOB-02",
          industry_id: testIndustryId,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second job", async () => {
      const result = await callProcedure(jobs.create, {
        title: "DevOps Engineer",
        serial_number: "JOB-03",
        industry_id: testIndustryId,
        country_id: testCountryId,
        category: "PRIVATE_SECTOR",
        seniority_level: "MID",
      });

      assert.ok(result.id);
      assert.strictEqual(result.title, "DevOps Engineer");
      createdJobId2 = result.id;
    });
  });

  describe("GET /jobs (GetAll)", () => {
    test("should successfully return all jobs", async () => {
      const results = await callProcedure(jobs.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);

      const titles = results.map((r: any) => r.title);
      assert.ok(titles.includes("Fullstack Developer"));
      assert.ok(titles.includes("DevOps Engineer"));
    });

    test("should successfully search jobs by title or description query", async () => {
      const results = await callProcedure(jobs.getAll, {
        name: "Fullstack",
      });

      assert.ok(Array.isArray(results));
      const titles = results.map((r: any) => r.title);
      assert.ok(titles.includes("Fullstack Developer"));
      assert.ok(!titles.includes("DevOps Engineer"));
    });

    test("should filter jobs by category", async () => {
      const results = await callProcedure(jobs.getAll, {
        category: "PRIVATE_SECTOR",
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });

    test("should filter jobs by seniority_level", async () => {
      const results = await callProcedure(jobs.getAll, {
        seniority_level: "SENIOR",
      });

      assert.ok(Array.isArray(results));
      const seniorities = results.map((r: any) => r.seniority_level);
      assert.ok(seniorities.includes("SENIOR"));
      assert.ok(!seniorities.includes("MID"));
    });

    test("should filter jobs by industry_id", async () => {
      const results = await callProcedure(jobs.getAll, {
        industry_id: testIndustryId,
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });

    test("should filter jobs by country_id", async () => {
      const results = await callProcedure(jobs.getAll, {
        country_id: testCountryId,
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });
  });

  describe("GET /jobs/{jobId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(jobs.getById, {
          jobId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the job by its ID", async () => {
      const result = await callProcedure(jobs.getById, {
        jobId: createdJobId1,
      });

      assert.strictEqual(result.id, createdJobId1);
      assert.strictEqual(result.title, "Fullstack Developer");
    });
  });

  describe("PATCH /jobs/{jobId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(jobs.update, {
          jobId: randomUUID(),
          title: "Updated Title",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update job fields", async () => {
      const currentYear = new Date().getFullYear();
      const result = await callProcedure(jobs.update, {
        jobId: createdJobId1,
        title: "Senior Fullstack Engineer",
        start_year: currentYear,
      });

      assert.strictEqual(result.id, createdJobId1);
      assert.strictEqual(result.title, "Senior Fullstack Engineer");
      assert.strictEqual(result.start_year, currentYear);

      // Verify in DB
      const dbJob = await database
        .selectFrom("jobs")
        .where("id", "=", createdJobId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbJob?.title, "Senior Fullstack Engineer");
    });
  });

  describe("DELETE /jobs/{jobId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(jobs.delete, {
          jobId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a job by ID", async () => {
      await callProcedure(jobs.delete, {
        jobId: createdJobId2,
      });

      // Verify DB
      const dbJob = await database
        .selectFrom("jobs")
        .where("id", "=", createdJobId2)
        .executeTakeFirst();
      assert.strictEqual(dbJob, undefined);

      createdJobId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /jobs (DeleteBulk)", () => {
    test("should successfully bulk delete jobs by IDs", async () => {
      // Create one more job to test bulk delete
      const extraJob = await callProcedure(jobs.create, {
        title: "Frontend Engineer",
        serial_number: "JOB-99",
        industry_id: testIndustryId,
      });

      const idsToDelete = [createdJobId1, extraJob.id];

      await callProcedure(jobs.deleteBulk, {
        jobIds: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("jobs")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdJobId1 = ""; // Mark as cleaned up
    });
  });
});
