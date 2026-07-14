import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { skills } from "../routes/skills";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("Skills API Endpoints", () => {
  let testIndustry = "Software Development";
  let createdSkillId1: string;
  let createdSkillId2: string;

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  before(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("BEGIN");
    }
  });

  after(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("ROLLBACK");
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
        industry: testIndustry,
        icon_url: "https://example.com/ts.png",
        type: "Technical",
        time_to_master: "6 months",
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
      assert.strictEqual(result.industry, testIndustry);
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
