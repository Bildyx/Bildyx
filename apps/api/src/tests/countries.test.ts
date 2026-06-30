import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { countries } from "../routes/countries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Countries API Endpoints", () => {
  let createdCountryId1: string;
  let createdCountryId2: string;

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
    // Clean up test countries
    try {
      const countryIds = [createdCountryId1, createdCountryId2].filter(Boolean);
      if (countryIds.length > 0) {
        await database
          .deleteFrom("countries")
          .where("id", "in", countryIds)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /countries (Create)", () => {
    test("should throw ZodError when name is missing", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          serialNumber: "FR-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serialNumber is missing", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          name: "France",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a country", async () => {
      const result = await callProcedure(countries.create, {
        name: "France",
        serialNumber: "FR-01",
        iso_code: "FR",
        calling_code: "+33",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "France");
      assert.strictEqual(result.serialNumber, "FR-01");
      createdCountryId1 = result.id;
    });

    test("should throw CONFLICT when creating a country with an existing name", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          name: "France",
          serialNumber: "FR-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second country", async () => {
      const result = await callProcedure(countries.create, {
        name: "Germany",
        serialNumber: "DE-01",
        iso_code: "DE",
        calling_code: "+49",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Germany");
      createdCountryId2 = result.id;
    });
  });

  describe("GET /countries (GetAll)", () => {
    test("should successfully return all countries", async () => {
      const results = await callProcedure(countries.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);

      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("France"));
      assert.ok(names.includes("Germany"));
    });

    test("should successfully search countries by name query", async () => {
      const results = await callProcedure(countries.getAll, {
        name: "Ger",
      });

      assert.ok(Array.isArray(results));
      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Germany"));
      assert.ok(!names.includes("France"));
    });
  });

  describe("GET /countries/{countryId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(countries.getById, {
          countryId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the country by its ID", async () => {
      const result = await callProcedure(countries.getById, {
        countryId: createdCountryId1,
      });

      assert.strictEqual(result.id, createdCountryId1);
      assert.strictEqual(result.name, "France");
      assert.strictEqual(result.serialNumber, "FR-01");
    });
  });

  describe("PUT /countries/{countryId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(countries.update, {
          countryId: randomUUID(),
          name: "Updated Name",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update country fields", async () => {
      const result = await callProcedure(countries.update, {
        countryId: createdCountryId1,
        name: "La France",
        calling_code: "+330",
      });

      assert.strictEqual(result.id, createdCountryId1);
      assert.strictEqual(result.name, "La France");
      assert.strictEqual(result.calling_code, "+330");

      // Verify in DB
      const dbCountry = await database
        .selectFrom("countries")
        .where("id", "=", createdCountryId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbCountry?.name, "La France");
    });
  });

  describe("DELETE /countries/{countryId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(countries.delete, {
          countryId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a country by ID", async () => {
      await callProcedure(countries.delete, {
        countryId: createdCountryId2,
      });

      // Verify DB
      const dbCountry = await database
        .selectFrom("countries")
        .where("id", "=", createdCountryId2)
        .executeTakeFirst();
      assert.strictEqual(dbCountry, undefined);

      createdCountryId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /countries (DeleteBulk)", () => {
    test("should successfully bulk delete countries by IDs", async () => {
      // Create one more country to test bulk delete
      const extraCountry = await callProcedure(countries.create, {
        name: "Spain",
        serialNumber: "ES-01",
      });

      const idsToDelete = [createdCountryId1, extraCountry.id];

      await callProcedure(countries.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("countries")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdCountryId1 = ""; // Mark as cleaned up
    });
  });
});
