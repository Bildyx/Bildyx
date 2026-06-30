import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { degrees } from "../routes/degrees";
import { countries } from "../routes/countries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Degrees API Endpoints", () => {
  let testCountryId: string;
  let testUniversityId: string;
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

    // Create a mock country
    const country = await callProcedure(countries.create, {
      name: "Degree Test Country",
      serialNumber: "DTC-01",
      iso_code: "DT",
    });
    testCountryId = country.id;

    // Create a mock university directly in DB
    testUniversityId = randomUUID();
    await database
      .insertInto("universities")
      .values({
        id: testUniversityId,
        name: "Degree Test University",
        serialNumber: "DTU-01",
        country_id: testCountryId,
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test degrees, university, and country
    try {
      const degreeIds = [createdDegreeId1, createdDegreeId2].filter(Boolean);
      if (degreeIds.length > 0) {
        await database
          .deleteFrom("degrees")
          .where("id", "in", degreeIds)
          .execute();
      }
      if (testUniversityId) {
        await database
          .deleteFrom("universities")
          .where("id", "=", testUniversityId)
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

  describe("POST /degrees (Create)", () => {
    test("should throw ZodError when name is missing or empty", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "",
          serialNumber: "DEG-01",
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should throw ZodError when serialNumber is missing or empty", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "Computer Science",
          serialNumber: "",
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should successfully create a degree", async () => {
      const result = await callProcedure(degrees.create, {
        name: "Computer Science",
        serialNumber: "DEG-01",
        university_id: testUniversityId,
        level: "BACHELOR",
        field: "Computer Science and IT",
        duration_years: 3.5,
        language_of_instruction: "English",
        country_id: testCountryId,
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Computer Science");
      assert.strictEqual(result.serialNumber, "DEG-01");
      assert.strictEqual(result.university_id, testUniversityId);
      createdDegreeId1 = result.id;
    });

    test("should throw CONFLICT when creating a degree with an existing name for the same university", async () => {
      await assert.rejects(
        callProcedure(degrees.create, {
          name: "Computer Science",
          serialNumber: "DEG-02",
          university_id: testUniversityId,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT"
      );
    });

    test("should successfully create a second degree", async () => {
      const result = await callProcedure(degrees.create, {
        name: "Mechanical Engineering",
        serialNumber: "DEG-03",
        university_id: testUniversityId,
        level: "MASTER",
        country_id: testCountryId,
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

    test("should successfully search degrees by name or field query", async () => {
      const results = await callProcedure(degrees.getAll, {
        search: "Computer",
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

    test("should filter degrees by university_id", async () => {
      const results = await callProcedure(degrees.getAll, {
        university_id: testUniversityId,
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });

    test("should filter degrees by country_id", async () => {
      const results = await callProcedure(degrees.getAll, {
        country_id: testCountryId,
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });
  });

  describe("GET /degrees/{degreeId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(degrees.getById, {
          degreeId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
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

  describe("PUT /degrees/{degreeId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(degrees.update, {
          degreeId: randomUUID(),
          name: "Updated Name",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
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
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
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

  describe("DELETE /degrees/bulk (DeleteBulk)", () => {
    test("should successfully bulk delete degrees by IDs", async () => {
      // Create one more degree to test bulk delete
      const extraDegree = await callProcedure(degrees.create, {
        name: "Aeronautics",
        serialNumber: "DEG-99",
        university_id: testUniversityId,
      });

      const idsToDelete = [createdDegreeId1, extraDegree.id];

      await callProcedure(degrees.deleteBulk, {
        ids: idsToDelete,
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
