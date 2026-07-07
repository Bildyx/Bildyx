import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { subjects } from "../routes/subjects";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Subjects API Endpoints", () => {
  let testOrgId: string;
  let createdSubjectId1: string;
  let createdSubjectId2: string;

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

    // Insert mock organization
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId,
        name: "Test Org for Subjects",
        slug: "test-org-subjects-slug",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test items
    try {
      // Hard delete any remaining subjects created in tests first
      await database.deleteFrom("subjects").execute();
      if (testOrgId) {
        await database
          .deleteFrom("organizations")
          .where("id", "=", testOrgId)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /subjects (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(subjects.create, {
          name: "",
          serial_number: "SUB-TEST-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is empty or missing", async () => {
      await assert.rejects(
        callProcedure(subjects.create, {
          name: "Test Subject",
          serial_number: "   ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a subject", async () => {
      const result = await callProcedure(subjects.create, {
        name: "Analytics Platform",
        serial_number: "SUB-TEST-01",
        category: "SOFTWARE",
        description: "An analytics service",
        organization_id: testOrgId,
        website_url: "https://example.com",
        logo_url: "https://example.com/logo.png",
        type: "SaaS",
        short_description: "Analytics",
        fun_fact: "Calculates fast",
        competitors: ["Competitor A", "Competitor B"],
        tags: ["data", "analytics"],
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Analytics Platform");
      assert.strictEqual(result.serial_number, "SUB-TEST-01");
      assert.strictEqual(result.category, "SOFTWARE");
      assert.strictEqual(result.organization_id, testOrgId);
      createdSubjectId1 = result.id;
    });

    test("should throw CONFLICT when creating a subject with the same name for the same organization", async () => {
      await assert.rejects(
        callProcedure(subjects.create, {
          name: "Analytics Platform",
          serial_number: "SUB-TEST-02",
          organization_id: testOrgId,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second subject", async () => {
      const result = await callProcedure(subjects.create, {
        name: "Developer API Gateway",
        serial_number: "SUB-TEST-02",
        category: "API",
      });

      assert.ok(result.id);
      assert.strictEqual(result.category, "API");
      assert.strictEqual(result.organization_id, null);
      createdSubjectId2 = result.id;
    });
  });

  describe("GET /subjects (GetAll)", () => {
    test("should successfully return all non-deleted subjects", async () => {
      const results = await callProcedure(subjects.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search subjects by name or description query", async () => {
      const results = await callProcedure(subjects.getAll, {
        name: "Gateway",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSubjectId2);
    });

    test("should filter subjects by category", async () => {
      const results = await callProcedure(subjects.getAll, {
        category: "SOFTWARE",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSubjectId1);
    });

    test("should filter subjects by organization_id", async () => {
      const results = await callProcedure(subjects.getAll, {
        organization_id: testOrgId,
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSubjectId1);
    });
  });

  describe("GET /subjects/{subjectId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(subjects.getById, {
          subjectId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the subject by its ID", async () => {
      const result = await callProcedure(subjects.getById, {
        subjectId: createdSubjectId1,
      });

      assert.strictEqual(result.id, createdSubjectId1);
      assert.strictEqual(result.name, "Analytics Platform");
    });
  });

  describe("PATCH /subjects/{subjectId} (Update)", () => {
    test("should successfully update subject fields", async () => {
      const result = await callProcedure(subjects.update, {
        subjectId: createdSubjectId1,
        name: "Enterprise Analytics Platform",
        type: "Enterprise SaaS",
      });

      assert.strictEqual(result.id, createdSubjectId1);
      assert.strictEqual(result.name, "Enterprise Analytics Platform");
      assert.strictEqual(result.type, "Enterprise SaaS");
    });
  });

  describe("DELETE /subjects/{subjectId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(subjects.delete, {
          subjectId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a subject by ID", async () => {
      await callProcedure(subjects.delete, {
        subjectId: createdSubjectId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(subjects.getById, {
          subjectId: createdSubjectId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(subjects.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdSubjectId2));

      createdSubjectId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /subjects (DeleteBulk)", () => {
    test("should successfully bulk soft delete subjects", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(subjects.create, {
        name: "Temporary subject to delete",
        serial_number: "SUB-BULK-DEL",
      });

      const idsToDelete = [createdSubjectId1, extra.id];

      await callProcedure(subjects.deleteBulk, {
        subjectIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(subjects.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdSubjectId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdSubjectId1 = ""; // Mark as cleaned up
    });
  });
});
