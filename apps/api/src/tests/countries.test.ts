import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { countries } from "../routes/countries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";

describe("Countries API Endpoints", () => {
  let createdCountryId1: string; // Will store "FR"
  let createdCountryId2: string; // Will store "DE"

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

  describe("POST /countries (Create)", () => {
    test("should throw ZodError when name is missing", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          serial_number: "FR-01",
          iso_code: "FR",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serial_number is missing", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          name: "France",
          iso_code: "FR",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a country", async () => {
      const result = await callProcedure(countries.create, {
        name: "France",
        serial_number: "FR-01",
        iso_code: "FR",
        calling_code: "+33",
      });

      assert.ok(result.iso_code);
      assert.strictEqual(result.iso_code, "FR");
      assert.strictEqual(result.name, "France");
      assert.strictEqual(result.serial_number, "FR-01");
      createdCountryId1 = result.iso_code;
    });

    test("should throw CONFLICT when creating a country with an existing name", async () => {
      await assert.rejects(
        callProcedure(countries.create, {
          name: "France",
          serial_number: "FR-02",
          iso_code: "FX",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second country", async () => {
      const result = await callProcedure(countries.create, {
        name: "Germany",
        serial_number: "DE-01",
        iso_code: "DE",
        calling_code: "+49",
      });

      assert.ok(result.iso_code);
      assert.strictEqual(result.iso_code, "DE");
      assert.strictEqual(result.name, "Germany");
      createdCountryId2 = result.iso_code;
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
          countryId: "XX",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the country by its ID", async () => {
      const result = await callProcedure(countries.getById, {
        countryId: createdCountryId1,
      });

      assert.strictEqual(result.iso_code, createdCountryId1);
      assert.strictEqual(result.name, "France");
      assert.strictEqual(result.serial_number, "FR-01");
    });
  });

  describe("PATCH /countries/{countryId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(countries.update, {
          countryId: "XX",
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

      assert.strictEqual(result.iso_code, createdCountryId1);
      assert.strictEqual(result.name, "La France");
      assert.strictEqual(result.calling_code, "+330");

      // Verify in DB
      const dbCountry = await database
        .selectFrom("countries")
        .where("iso_code", "=", createdCountryId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbCountry?.name, "La France");
    });
  });

  describe("DELETE /countries/{countryId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(countries.delete, {
          countryId: "XX",
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
        .where("iso_code", "=", createdCountryId2)
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
        serial_number: "ES-01",
        iso_code: "ES",
      });

      const idsToDelete = [createdCountryId1, extraCountry.iso_code];

      await callProcedure(countries.deleteBulk, {
        countryIds: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("countries")
        .where("iso_code", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdCountryId1 = ""; // Mark as cleaned up
    });
  });
});
