import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { skills } from "../routes/skills";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Skills API Endpoints", () => {
  let testIndustryId: string;
  let createdSkillId1: string;
  let createdSkillId2: string;

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

    testIndustryId = randomUUID();

    // Insert mock industry
    await database
      .insertInto("industries")
      .values({
        id: testIndustryId,
        name: "Test Industry for Skills",
        serial_number: "IND-SKILL-TEST-01",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test items
    try {
      if (testIndustryId) {
        await database
          .deleteFrom("industries")
          .where("id", "=", testIndustryId)
          .execute();
      }
      // Hard delete any remaining skills created in tests
      await database.deleteFrom("skills").execute();
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /skills (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(skills.create, {
          name: "",
          serial_number: "SKL-CREATE-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is empty or missing", async () => {
      await assert.rejects(
        callProcedure(skills.create, {
          name: "TypeScript Programming",
          serial_number: "  ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a skill", async () => {
      const result = await callProcedure(skills.create, {
        name: "TypeScript Programming",
        serial_number: "SKL-CREATE-01",
        category: "LANGUAGE",
        difficulty: "INTERMEDIATE",
        description: "Strong typing in JS",
        industry_id: testIndustryId,
        icon_url: "https://example.com/ts.png",
        type: "Technical",
        time_to_master: "6 months",
        categories: ["coding", "frontend"],
        used_in: ["web applications", "backend servers"],
        jobs: ["Frontend Engineer", "Backend Developer"],
        product_categories: ["compiler"],
        common_fields_of_study: ["Computer Science"],
        related_abilities: ["Logical reasoning"],
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "TypeScript Programming");
      assert.strictEqual(result.serial_number, "SKL-CREATE-01");
      assert.strictEqual(result.category, "LANGUAGE");
      assert.strictEqual(result.difficulty, "INTERMEDIATE");
      assert.strictEqual(result.industry_id, testIndustryId);
      createdSkillId1 = result.id;
    });

    test("should throw CONFLICT when creating a skill with an existing name", async () => {
      await assert.rejects(
        callProcedure(skills.create, {
          name: "TypeScript Programming",
          serial_number: "SKL-CREATE-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second skill", async () => {
      const result = await callProcedure(skills.create, {
        name: "Agile Project Management",
        serial_number: "SKL-CREATE-02",
        category: "METHODOLOGY",
        difficulty: "ADVANCED",
      });

      assert.ok(result.id);
      assert.strictEqual(result.category, "METHODOLOGY");
      createdSkillId2 = result.id;
    });
  });

  describe("GET /skills (GetAll)", () => {
    test("should successfully list all non-deleted skills", async () => {
      const results = await callProcedure(skills.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search skills by name or description query", async () => {
      const results = await callProcedure(skills.getAll, {
        name: "typing",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSkillId1);
    });

    test("should filter skills by category", async () => {
      const results = await callProcedure(skills.getAll, {
        category: "METHODOLOGY",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSkillId2);
    });

    test("should filter skills by difficulty", async () => {
      const results = await callProcedure(skills.getAll, {
        difficulty: "INTERMEDIATE",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdSkillId1);
    });
  });

  describe("GET /skills/{skillId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(skills.getById, {
          skillId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the skill by its ID", async () => {
      const result = await callProcedure(skills.getById, {
        skillId: createdSkillId1,
      });

      assert.strictEqual(result.id, createdSkillId1);
      assert.strictEqual(result.name, "TypeScript Programming");
    });
  });

  describe("PATCH /skills/{skillId} (Update)", () => {
    test("should successfully update skill fields", async () => {
      const result = await callProcedure(skills.update, {
        skillId: createdSkillId1,
        name: "TypeScript Advanced Programming",
        difficulty: "EXPERT",
      });

      assert.strictEqual(result.id, createdSkillId1);
      assert.strictEqual(result.name, "TypeScript Advanced Programming");
      assert.strictEqual(result.difficulty, "EXPERT");
    });
  });

  describe("DELETE /skills/{skillId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(skills.delete, {
          skillId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a skill", async () => {
      await callProcedure(skills.delete, {
        skillId: createdSkillId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(skills.getById, {
          skillId: createdSkillId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(skills.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdSkillId2));

      createdSkillId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /skills (DeleteBulk)", () => {
    test("should successfully bulk soft delete skills", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(skills.create, {
        name: "Temporary skill to delete",
        serial_number: "SKL-BULK-DEL",
      });

      const idsToDelete = [createdSkillId1, extra.id];

      await callProcedure(skills.deleteBulk, {
        skillIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(skills.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdSkillId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdSkillId1 = ""; // Mark as cleaned up
    });
  });
});
