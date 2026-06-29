import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { cities } from "../routes/cities";
import { countries } from "../routes/countries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Cities API Endpoints", () => {
  let testCountryId: string;
  let createdCityId1: string;
  let createdCityId2: string;

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

    // Create a parent country for the cities
    const country = await callProcedure(countries.create, {
      name: "City Parent Country",
      serialNumber: "CPC-01",
      iso_code: "CP",
    });
    testCountryId = country.id;
  });

  after(async () => {
    // Clean up test cities and country
    try {
      const cityIds = [createdCityId1, createdCityId2].filter(Boolean);
      if (cityIds.length > 0) {
        await database
          .deleteFrom("cities")
          .where("id", "in", cityIds)
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

  describe("POST /cities (Create)", () => {
    test("should throw ZodError when name is missing or empty", async () => {
      await assert.rejects(
        callProcedure(cities.create, {
          name: "",
          serialNumber: "NYC-01",
          country_id: testCountryId,
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should throw ZodError when serialNumber is missing or empty", async () => {
      await assert.rejects(
        callProcedure(cities.create, {
          name: "New York",
          serialNumber: "",
          country_id: testCountryId,
        }),
        (err: any) => err.name === "ZodError"
      );
    });

    test("should successfully create a city", async () => {
      const result = await callProcedure(cities.create, {
        name: "New York",
        serialNumber: "NYC-01",
        country_id: testCountryId,
        is_capital: false,
        population: 8400000,
        average_rent: 3500,
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "New York");
      assert.strictEqual(result.serialNumber, "NYC-01");
      assert.strictEqual(result.country_id, testCountryId);
      createdCityId1 = result.id;
    });

    test("should throw CONFLICT when creating a city with an existing name in the same country", async () => {
      await assert.rejects(
        callProcedure(cities.create, {
          name: "New York",
          serialNumber: "NYC-02",
          country_id: testCountryId,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT"
      );
    });

    test("should successfully create a second city", async () => {
      const result = await callProcedure(cities.create, {
        name: "Los Angeles",
        serialNumber: "LAX-01",
        country_id: testCountryId,
        is_capital: false,
        population: 3900000,
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Los Angeles");
      createdCityId2 = result.id;
    });
  });

  describe("GET /cities (GetAll)", () => {
    test("should successfully return all cities", async () => {
      const results = await callProcedure(cities.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);

      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("New York"));
      assert.ok(names.includes("Los Angeles"));
    });

    test("should successfully search cities by name query", async () => {
      const results = await callProcedure(cities.getAll, {
        search: "Angeles",
      });

      assert.ok(Array.isArray(results));
      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Los Angeles"));
      assert.ok(!names.includes("New York"));
    });

    test("should filter cities by country_id", async () => {
      const results = await callProcedure(cities.getAll, {
        country_id: testCountryId,
      });

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);
    });
  });

  describe("GET /cities/{cityId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(cities.getById, {
          cityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully return the city by its ID", async () => {
      const result = await callProcedure(cities.getById, {
        cityId: createdCityId1,
      });

      assert.strictEqual(result.id, createdCityId1);
      assert.strictEqual(result.name, "New York");
    });
  });

  describe("PATCH /cities/{cityId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(cities.update, {
          cityId: randomUUID(),
          name: "Updated Name",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully update city fields", async () => {
      const result = await callProcedure(cities.update, {
        cityId: createdCityId1,
        name: "NYC",
        average_rent: 4000,
      });

      assert.strictEqual(result.id, createdCityId1);
      assert.strictEqual(result.name, "NYC");
      assert.strictEqual(result.average_rent, 4000);

      // Verify in DB
      const dbCity = await database
        .selectFrom("cities")
        .where("id", "=", createdCityId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbCity?.name, "NYC");
    });
  });

  describe("DELETE /cities/{cityId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(cities.delete, {
          cityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND"
      );
    });

    test("should successfully delete a city by ID", async () => {
      await callProcedure(cities.delete, {
        cityId: createdCityId2,
      });

      // Verify DB
      const dbCity = await database
        .selectFrom("cities")
        .where("id", "=", createdCityId2)
        .executeTakeFirst();
      assert.strictEqual(dbCity, undefined);

      createdCityId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /cities/bulk (DeleteBulk)", () => {
    test("should successfully bulk delete cities by IDs", async () => {
      // Create one more city to test bulk delete
      const extraCity = await callProcedure(cities.create, {
        name: "Chicago",
        serialNumber: "ORD-01",
        country_id: testCountryId,
      });

      const idsToDelete = [createdCityId1, extraCity.id];

      await callProcedure(cities.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("cities")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdCityId1 = ""; // Mark as cleaned up
    });
  });
});
