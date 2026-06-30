import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { industries } from "../routes/industries";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Industries API Endpoints", () => {
  let createdIndustryId1: string;
  let createdIndustryId2: string;

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
    // Clean up test industries
    try {
      const industryIds = [createdIndustryId1, createdIndustryId2].filter(
        Boolean,
      );
      if (industryIds.length > 0) {
        await database
          .deleteFrom("industries")
          .where("id", "in", industryIds)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /industries (Create)", () => {
    test("should throw ZodError when name is missing or empty", async () => {
      await assert.rejects(
        callProcedure(industries.create, {
          name: "",
          serialNumber: "IND-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serialNumber is missing or empty", async () => {
      await assert.rejects(
        callProcedure(industries.create, {
          name: "Software Engineering",
          serialNumber: "",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create an industry", async () => {
      const result = await callProcedure(industries.create, {
        name: "Software Engineering",
        serialNumber: "IND-01",
        description: "IT and Software services",
        color: "#007acc",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Software Engineering");
      assert.strictEqual(result.serialNumber, "IND-01");
      createdIndustryId1 = result.id;
    });

    test("should throw CONFLICT when creating an industry with an existing name", async () => {
      await assert.rejects(
        callProcedure(industries.create, {
          name: "Software Engineering",
          serialNumber: "IND-02",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second industry", async () => {
      const result = await callProcedure(industries.create, {
        name: "Biotechnology",
        serialNumber: "IND-03",
        description: "Bio research and medical services",
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Biotechnology");
      createdIndustryId2 = result.id;
    });
  });

  describe("GET /industries (GetAll)", () => {
    test("should successfully return all industries", async () => {
      const results = await callProcedure(industries.getAll, {});

      assert.ok(Array.isArray(results));
      assert.ok(results.length >= 2);

      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Software Engineering"));
      assert.ok(names.includes("Biotechnology"));
    });

    test("should successfully search industries by name query", async () => {
      const results = await callProcedure(industries.getAll, {
        search: "Software",
      });

      assert.ok(Array.isArray(results));
      const names = results.map((r: any) => r.name);
      assert.ok(names.includes("Software Engineering"));
      assert.ok(!names.includes("Biotechnology"));
    });
  });

  describe("GET /industries/{industryId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(industries.getById, {
          industryId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the industry by its ID", async () => {
      const result = await callProcedure(industries.getById, {
        industryId: createdIndustryId1,
      });

      assert.strictEqual(result.id, createdIndustryId1);
      assert.strictEqual(result.name, "Software Engineering");
    });
  });

  describe("PUT /industries/{industryId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(industries.update, {
          industryId: randomUUID(),
          name: "Updated Name",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update industry fields", async () => {
      const result = await callProcedure(industries.update, {
        industryId: createdIndustryId1,
        name: "Software & IT Services",
        color: "#333333",
      });

      assert.strictEqual(result.id, createdIndustryId1);
      assert.strictEqual(result.name, "Software & IT Services");
      assert.strictEqual(result.color, "#333333");

      // Verify in DB
      const dbIndustry = await database
        .selectFrom("industries")
        .where("id", "=", createdIndustryId1)
        .selectAll()
        .executeTakeFirst();
      assert.strictEqual(dbIndustry?.name, "Software & IT Services");
    });
  });

  describe("DELETE /industries/{industryId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(industries.delete, {
          industryId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete an industry by ID", async () => {
      await callProcedure(industries.delete, {
        industryId: createdIndustryId2,
      });

      // Verify DB
      const dbIndustry = await database
        .selectFrom("industries")
        .where("id", "=", createdIndustryId2)
        .executeTakeFirst();
      assert.strictEqual(dbIndustry, undefined);

      createdIndustryId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /industries/bulk (DeleteBulk)", () => {
    test("should successfully bulk delete industries by IDs", async () => {
      // Create one more industry to test bulk delete
      const extraIndustry = await callProcedure(industries.create, {
        name: "Aerospace",
        serialNumber: "IND-99",
      });

      const idsToDelete = [createdIndustryId1, extraIndustry.id];

      await callProcedure(industries.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify DB
      const remaining = await database
        .selectFrom("industries")
        .where("id", "in", idsToDelete)
        .execute();
      assert.strictEqual(remaining.length, 0);

      createdIndustryId1 = ""; // Mark as cleaned up
    });
  });
});
