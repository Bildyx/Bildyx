import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { universities } from "../routes/universities";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("Universities API Endpoints", () => {
  let testCountryId: string;
  let testCityId: string;
  let createdUniId1: string;
  let createdUniId2: string;

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

    testCountryId = "UN";
    testCityId = randomUUID();

    // Insert mock country
    await database
      .insertInto("countries")
      .values({
        iso_code: testCountryId,
        name: "Test Country for Uni",
        serial_number: "CNT-UNI-01",
        updated_at: new Date(),
      })
      .execute();

    // Insert mock city
    await database
      .insertInto("cities")
      .values({
        id: testCityId,
        name: "Test City for Uni",
        serial_number: "CTY-UNI-01",
        country_id: testCountryId,
        currency: "USD",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("ROLLBACK");
    }
  });

  describe("POST /universities (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(universities.create, {
          name: "",
          serial_number: "UNI-CREATE-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is empty or missing", async () => {
      await assert.rejects(
        callProcedure(universities.create, {
          name: "Sorbonne University",
          serial_number: "   ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a university", async () => {
      const result = await callProcedure(universities.create, {
        name: "Sorbonne University",
        serial_number: "UNI-CREATE-01",
        type: "UNIVERSITY",
        description: "Prestigious university in France",
        website_url: "https://sorbonne.edu",
        logo_url: "https://sorbonne.edu/logo.png",
        country_id: testCountryId,
        city_id: testCityId,
        student_count: 55000,
        undergraduates: 35000,
        postgraduates: 20000,
        score: 95,
        local_name: "Université de la Sorbonne",
        notes: "Historical campus",
        established: "1257",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Sorbonne University");
      assert.strictEqual(result.serial_number, "UNI-CREATE-01");
      assert.strictEqual(result.type, "UNIVERSITY");
      assert.strictEqual(result.country_id, testCountryId);
      assert.strictEqual(result.city_id, testCityId);
      createdUniId1 = result.id;
    });

    test("should throw CONFLICT when creating a university with an existing name", async () => {
      await assert.rejects(
        callProcedure(universities.create, {
          name: "Sorbonne University",
          serial_number: "UNI-CREATE-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second university", async () => {
      const result = await callProcedure(universities.create, {
        name: "Polytechnique Grande Ecole",
        serial_number: "UNI-CREATE-02",
        type: "GRANDE_ECOLE",
      });

      assert.ok(result.id);
      assert.strictEqual(result.type, "GRANDE_ECOLE");
      createdUniId2 = result.id;
    });
  });

  describe("GET /universities (GetAll)", () => {
    test("should successfully list all non-deleted universities", async () => {
      const results = await callProcedure(universities.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search universities by name or local_name query", async () => {
      const results = await callProcedure(universities.getAll, {
        name: "Sorbonne",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdUniId1);
    });

    test("should filter universities by type", async () => {
      const results = await callProcedure(universities.getAll, {
        type: "GRANDE_ECOLE",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdUniId2);
    });

    test("should filter universities by country_id", async () => {
      const results = await callProcedure(universities.getAll, {
        country_id: testCountryId,
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdUniId1);
    });
  });

  describe("GET /universities/{universityId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(universities.getById, {
          universityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the university by its ID", async () => {
      const result = await callProcedure(universities.getById, {
        universityId: createdUniId1,
      });

      assert.strictEqual(result.id, createdUniId1);
      assert.strictEqual(result.name, "Sorbonne University");
    });
  });

  describe("PATCH /universities/{universityId} (Update)", () => {
    test("should successfully update university fields", async () => {
      const result = await callProcedure(universities.update, {
        universityId: createdUniId1,
        name: "Sorbonne Université Paris",
        score: 97,
      });

      assert.strictEqual(result.id, createdUniId1);
      assert.strictEqual(result.name, "Sorbonne Université Paris");
      assert.strictEqual(result.score, 97);
    });
  });

  describe("DELETE /universities/{universityId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(universities.delete, {
          universityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a university by ID", async () => {
      await callProcedure(universities.delete, {
        universityId: createdUniId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(universities.getById, {
          universityId: createdUniId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(universities.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdUniId2));

      createdUniId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /universities (DeleteBulk)", () => {
    test("should successfully bulk soft delete universities", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(universities.create, {
        name: "Temporary university to delete",
        serial_number: "UNI-BULK-DEL",
      });

      const idsToDelete = [createdUniId1, extra.id];

      await callProcedure(universities.deleteBulk, {
        universityIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(universities.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdUniId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdUniId1 = ""; // Mark as cleaned up
    });
  });
});
