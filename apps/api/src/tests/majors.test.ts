import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { majors } from "../routes/majors";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Majors API Endpoints", () => {
  let createdMajorId1: string;
  let createdMajorId2: string;

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
    // Clean up test items
    try {
      await database.deleteFrom("majors").execute();
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /majors (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(majors.create, {
          name: "",
          serial_number: "MAJ-TEST-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is empty or missing", async () => {
      await assert.rejects(
        callProcedure(majors.create, {
          name: "Computer Science",
          serial_number: "   ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a major", async () => {
      const result = await callProcedure(majors.create, {
        name: "Computer Science",
        serial_number: "MAJ-TEST-01",
        area: "Engineering",
        description: "Study of computers and computational systems",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Computer Science");
      assert.strictEqual(result.serial_number, "MAJ-TEST-01");
      assert.strictEqual(result.area, "Engineering");
      createdMajorId1 = result.id;
    });

    test("should throw CONFLICT when creating a major with the same name", async () => {
      await assert.rejects(
        callProcedure(majors.create, {
          name: "Computer Science",
          serial_number: "MAJ-TEST-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second major", async () => {
      const result = await callProcedure(majors.create, {
        name: "Mathematics",
        serial_number: "MAJ-TEST-02",
        area: "Science",
      });

      assert.ok(result.id);
      assert.strictEqual(result.area, "Science");
      createdMajorId2 = result.id;
    });
  });

  describe("GET /majors (GetAll)", () => {
    test("should successfully return all non-deleted majors", async () => {
      const results = await callProcedure(majors.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search majors by name or description query", async () => {
      const results = await callProcedure(majors.getAll, {
        name: "Science",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdMajorId2);
    });

    test("should filter majors by area", async () => {
      const results = await callProcedure(majors.getAll, {
        area: "Engineering",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdMajorId1);
    });
  });

  describe("GET /majors/{majorId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(majors.getById, {
          majorId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the major by its ID", async () => {
      const result = await callProcedure(majors.getById, {
        majorId: createdMajorId1,
      });

      assert.strictEqual(result.id, createdMajorId1);
      assert.strictEqual(result.name, "Computer Science");
    });
  });

  describe("PATCH /majors/{majorId} (Update)", () => {
    test("should successfully update major fields", async () => {
      const result = await callProcedure(majors.update, {
        majorId: createdMajorId1,
        name: "Advanced Computer Science",
        area: "Advanced Engineering",
      });

      assert.strictEqual(result.id, createdMajorId1);
      assert.strictEqual(result.name, "Advanced Computer Science");
      assert.strictEqual(result.area, "Advanced Engineering");
    });
  });

  describe("DELETE /majors/{majorId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(majors.delete, {
          majorId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a major by ID", async () => {
      await callProcedure(majors.delete, {
        majorId: createdMajorId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(majors.getById, {
          majorId: createdMajorId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(majors.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdMajorId2));

      createdMajorId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /majors (DeleteBulk)", () => {
    test("should successfully bulk soft delete majors", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(majors.create, {
        name: "Temporary major to delete",
        serial_number: "MAJ-BULK-DEL",
      });

      const idsToDelete = [createdMajorId1, extra.id];

      await callProcedure(majors.deleteBulk, {
        majorIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(majors.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdMajorId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdMajorId1 = ""; // Mark as cleaned up
    });
  });
});
