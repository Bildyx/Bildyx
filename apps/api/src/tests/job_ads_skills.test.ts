import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { job_ads_skills } from "../routes/job_ads_skills";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Job Ad Skills API Endpoints", () => {
  let testOrgId: string;
  let testJobAdId: string;
  let testSkillId1: string;
  let testSkillId2: string;
  let createdJobAdSkillId1: string;
  let createdJobAdSkillId2: string;

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
    testJobAdId = randomUUID();
    testSkillId1 = randomUUID();
    testSkillId2 = randomUUID();

    // Insert mock organization
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId,
        name: "Test Org",
        slug: "test-org-slug",
        updated_at: new Date(),
      })
      .execute();

    // Insert mock job ad
    await database
      .insertInto("job_ads")
      .values({
        id: testJobAdId,
        title: "Test Job Ad",
        serialNumber: "JAD-TEST-01",
        organization_id: testOrgId,
        updated_at: new Date(),
      })
      .execute();

    // Insert mock skills
    await database
      .insertInto("skills")
      .values({
        id: testSkillId1,
        name: "Test Skill 1",
        serialNumber: "SKL-TEST-01",
        updated_at: new Date(),
      })
      .execute();

    await database
      .insertInto("skills")
      .values({
        id: testSkillId2,
        name: "Test Skill 2",
        serialNumber: "SKL-TEST-02",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test items
    try {
      const ids = [createdJobAdSkillId1, createdJobAdSkillId2].filter(Boolean);
      if (ids.length > 0) {
        await database
          .deleteFrom("job_ad_skills")
          .where("id", "in", ids)
          .execute();
      }
      if (testSkillId1) {
        await database.deleteFrom("skills").where("id", "=", testSkillId1).execute();
      }
      if (testSkillId2) {
        await database.deleteFrom("skills").where("id", "=", testSkillId2).execute();
      }
      if (testJobAdId) {
        await database.deleteFrom("job_ads").where("id", "=", testJobAdId).execute();
      }
      if (testOrgId) {
        await database.deleteFrom("organizations").where("id", "=", testOrgId).execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /job-ad-skills (Create)", () => {
    test("should throw ZodError when job_ad_id is missing or invalid", async () => {
      await assert.rejects(
        callProcedure(job_ads_skills.create, {
          job_ad_id: "invalid-uuid",
          skill_id: testSkillId1,
          importance: "REQUIRED",
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should successfully add a skill to a job ad", async () => {
      const result = await callProcedure(job_ads_skills.create, {
        job_ad_id: testJobAdId,
        skill_id: testSkillId1,
        importance: "REQUIRED",
      });

      assert.ok(result.id);
      assert.strictEqual(result.job_ad_id, testJobAdId);
      assert.strictEqual(result.skill_id, testSkillId1);
      assert.strictEqual(result.importance, "REQUIRED");
      createdJobAdSkillId1 = result.id;
    });

    test("should throw CONFLICT when adding the same skill to the same job ad", async () => {
      await assert.rejects(
        callProcedure(job_ads_skills.create, {
          job_ad_id: testJobAdId,
          skill_id: testSkillId1,
          importance: "PREFERRED",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT"
      );
    });

    test("should successfully add a second skill to a job ad", async () => {
      const result = await callProcedure(job_ads_skills.create, {
        job_ad_id: testJobAdId,
        skill_id: testSkillId2,
        importance: "NICE_TO_HAVE",
      });

      assert.ok(result.id);
      assert.strictEqual(result.skill_id, testSkillId2);
      createdJobAdSkillId2 = result.id;
    });
  });

  describe("GET /job-ad-skills (GetAll & GetByJobAd)", () => {
    test("should successfully return all job ad skills", async () => {
      const results = await callProcedure(job_ads_skills.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });

    test("should successfully return skills by job ad ID", async () => {
      const results = await callProcedure(job_ads_skills.getByJobAd, {
        jobAdId: testJobAdId,
      });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
      const skillIds = results.map((r: any) => r.skill_id);
      assert.ok(skillIds.includes(testSkillId1));
      assert.ok(skillIds.includes(testSkillId2));
    });
  });

  describe("PUT /job-ad-skills/{jobAdSkillId} (Update)", () => {
    test("should successfully update importance", async () => {
      const result = await callProcedure(job_ads_skills.update, {
        jobAdSkillId: createdJobAdSkillId1,
        importance: "PREFERRED",
      });

      assert.strictEqual(result.id, createdJobAdSkillId1);
      assert.strictEqual(result.importance, "PREFERRED");

      // Verify DB
      const dbItem = await database
        .selectFrom("job_ad_skills")
        .where("id", "=", createdJobAdSkillId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbItem?.importance, "PREFERRED");
    });
  });

  describe("DELETE /job-ad-skills/{jobAdSkillId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(job_ads_skills.delete, {
          jobAdSkillId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully delete a job ad skill by ID", async () => {
      await callProcedure(job_ads_skills.delete, {
        jobAdSkillId: createdJobAdSkillId2,
      });

      // Verify DB
      const dbItem = await database
        .selectFrom("job_ad_skills")
        .where("id", "=", createdJobAdSkillId2)
        .executeTakeFirst();
      assert.strictEqual(dbItem, undefined);

      createdJobAdSkillId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /job-ad-skills/bulk (DeleteBulk)", () => {
    test("should successfully bulk delete job ad skills by IDs", async () => {
      // Create one more to test bulk delete
      const extra = await callProcedure(job_ads_skills.create, {
        job_ad_id: testJobAdId,
        skill_id: testSkillId2,
        importance: "REQUIRED",
      });

      const idsToDelete = [createdJobAdSkillId1, extra.id];

      await callProcedure(job_ads_skills.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("job_ad_skills")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdJobAdSkillId1 = ""; // Mark as cleaned up
    });
  });
});
