import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { degrees } from "../routes/degrees";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Degrees API Endpoints", () => {
  let createdDegreeId1: string;
  let createdDegreeId2: string;

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
  });

  after(async () => {
    // Clean up test degrees
    try {
      const degreeIds = [createdDegreeId1, createdDegreeId2].filter(Boolean);
      if (degreeIds.length > 0) {
        await database
          .deleteFrom("degrees")
          .where("id", "in", degreeIds)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /degrees (Create)", () => {
    test("should throw ZodError when name is missing or empty", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "",
          serialNumber: "DEG-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serialNumber is missing or empty", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "Computer Science",
          serialNumber: "",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a degree", async () => {
      const result = await callProcedure(degrees.create, {
        name: "Computer Science",
        serialNumber: "DEG-01",
        level: "BACHELOR",
        area: "Computer Science and IT",
        duration_years: 3.5,
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Computer Science");
      assert.strictEqual(result.serialNumber, "DEG-01");
      createdDegreeId1 = result.id;
    });

    test("should throw CONFLICT when creating a degree with an existing name", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "Computer Science",
          serialNumber: "DEG-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second degree", async () => {
      const result = await callProcedure(degrees.create, {
        name: "Mechanical Engineering",
        serialNumber: "DEG-03",
        level: "MASTER",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Mechanical Engineering");
      createdDegreeId2 = result.id;
    });
  });

  describe("GET /degrees (GetAll)", () => {
    test("should successfully return all degrees", async () => {
      const results = await callProcedure(degrees.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);

      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Computer Science"));
      assert.ok(names.includes("Mechanical Engineering"));
    });

    test("should successfully search degrees by name or area query", async () => {
      const results = await callProcedure(degrees.getAll, {
        name: "Computer",
      });

      assert.ok(Array.isArray(results));
      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Computer Science"));
      assert.ok(!names.includes("Mechanical Engineering"));
    });

    test("should filter degrees by level", async () => {
      const results = await callProcedure(degrees.getAll, {
        level: "BACHELOR",
      });

      assert.ok(Array.isArray(results));
      const levels = results.map((r: any) => r.level);
      assert.ok(levels.includes("BACHELOR"));
      assert.ok(!levels.includes("MASTER"));
    });
  });

  describe("GET /degrees/{degreeId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(degrees.getById, {
          degreeId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the degree by its ID", async () => {
      const result = await callProcedure(degrees.getById, {
        degreeId: createdDegreeId1,
      });

      assert.strictEqual(result.id, createdDegreeId1);
      assert.strictEqual(result.name, "Computer Science");
    });
  });

  describe("PATCH /degrees/{degreeId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(degrees.update, {
          degreeId: randomUUID(),
          name: "Updated Name",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update degree fields", async () => {
      const result = await callProcedure(degrees.update, {
        degreeId: createdDegreeId1,
        name: "Computer Science & Engineering",
        duration_years: 4,
      });

      assert.strictEqual(result.id, createdDegreeId1);
      assert.strictEqual(result.name, "Computer Science & Engineering");
      assert.strictEqual(result.duration_years, 4);

      // Verify in DB
      const dbDegree = await database
        .selectFrom("degrees")
        .where("id", "=", createdDegreeId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbDegree?.name, "Computer Science & Engineering");
    });
  });

  describe("DELETE /degrees/{degreeId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(degrees.delete, {
          degreeId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a degree by ID", async () => {
      await callProcedure(degrees.delete, {
        degreeId: createdDegreeId2,
      });

      // Verify DB
      const dbDegree = await database
        .selectFrom("degrees")
        .where("id", "=", createdDegreeId2)
        .executeTakeFirst();
      assert.strictEqual(dbDegree, undefined);

      createdDegreeId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /degrees (DeleteBulk)", () => {
    test("should successfully bulk delete degrees by IDs", async () => {
      // Create one more degree to test bulk delete
      const extraDegree = await callProcedure(degrees.create, {
        name: "Aeronautics",
        serialNumber: "DEG-99",
      });

      const idsToDelete = [createdDegreeId1, extraDegree.id];

      await callProcedure(degrees.deleteBulk, {
        degreeIds: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("degrees")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdDegreeId1 = ""; // Mark as cleaned up
    });
  });
});
