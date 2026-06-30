import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { products } from "../routes/products";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Products API Endpoints", () => {
  let testOrgId: string;
  let createdProductId1: string;
  let createdProductId2: string;

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

    testOrgId = randomUUID();

    // Insert mock organization
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId,
        name: "Test Org for Products",
        slug: "test-org-products-slug",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    // Clean up test items
    try {
      // Hard delete any remaining products created in tests first
      await database.deleteFrom("products").execute();
      if (testOrgId) {
        await database
          .deleteFrom("organizations")
          .where("id", "=", testOrgId)
          .execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    } finally {
      await database.destroy();
    }
  });

  describe("POST /products (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(products.create, {
          name: "",
          serialNumber: "PRD-TEST-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when serialNumber is empty or missing", async () => {
      await assert.rejects(
        callProcedure(products.create, {
          name: "Test Software",
          serialNumber: "   ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a product", async () => {
      const result = await callProcedure(products.create, {
        name: "Analytics Platform",
        serialNumber: "PRD-TEST-01",
        category: "SOFTWARE",
        description: "An analytics service",
        organization_id: testOrgId,
        website_url: "https://example.com",
        logo_url: "https://example.com/logo.png",
        type: "SaaS",
        short_description: "Analytics",
        fun_fact: "Calculates fast",
        competitors: ["Competitor A", "Competitor B"],
        tags: ["data", "analytics"],
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Analytics Platform");
      assert.strictEqual(result.serialNumber, "PRD-TEST-01");
      assert.strictEqual(result.category, "SOFTWARE");
      assert.strictEqual(result.organization_id, testOrgId);
      createdProductId1 = result.id;
    });

    test("should throw CONFLICT when creating a product with the same name for the same organization", async () => {
      await assert.rejects(
        callProcedure(products.create, {
          name: "Analytics Platform",
          serialNumber: "PRD-TEST-02",
          organization_id: testOrgId,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second product", async () => {
      const result = await callProcedure(products.create, {
        name: "Developer API Gateway",
        serialNumber: "PRD-TEST-02",
        category: "API",
      });

      assert.ok(result.id);
      assert.strictEqual(result.category, "API");
      assert.strictEqual(result.organization_id, null);
      createdProductId2 = result.id;
    });
  });

  describe("GET /products (GetAll)", () => {
    test("should successfully return all non-deleted products", async () => {
      const results = await callProcedure(products.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search products by name or description query", async () => {
      const results = await callProcedure(products.getAll, {
        search: "Gateway",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdProductId2);
    });

    test("should filter products by category", async () => {
      const results = await callProcedure(products.getAll, {
        category: "SOFTWARE",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdProductId1);
    });

    test("should filter products by organization_id", async () => {
      const results = await callProcedure(products.getAll, {
        organization_id: testOrgId,
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdProductId1);
    });
  });

  describe("GET /products/{productId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(products.getById, {
          productId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the product by its ID", async () => {
      const result = await callProcedure(products.getById, {
        productId: createdProductId1,
      });

      assert.strictEqual(result.id, createdProductId1);
      assert.strictEqual(result.name, "Analytics Platform");
    });
  });

  describe("PUT /products/{productId} (Update)", () => {
    test("should successfully update product fields", async () => {
      const result = await callProcedure(products.update, {
        productId: createdProductId1,
        name: "Enterprise Analytics Platform",
        type: "Enterprise SaaS",
      });

      assert.strictEqual(result.id, createdProductId1);
      assert.strictEqual(result.name, "Enterprise Analytics Platform");
      assert.strictEqual(result.type, "Enterprise SaaS");
    });
  });

  describe("DELETE /products/{productId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(products.delete, {
          productId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a product by ID", async () => {
      await callProcedure(products.delete, {
        productId: createdProductId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(products.getById, {
          productId: createdProductId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(products.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdProductId2));

      createdProductId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /products (DeleteBulk)", () => {
    test("should successfully bulk soft delete products", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(products.create, {
        name: "Temporary product to delete",
        serialNumber: "PRD-BULK-DEL",
      });

      const idsToDelete = [createdProductId1, extra.id];

      await callProcedure(products.deleteBulk, {
        ids: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(products.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdProductId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdProductId1 = ""; // Mark as cleaned up
    });
  });
});
