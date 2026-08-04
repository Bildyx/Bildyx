import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { organizations } from "../routes/organizations";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("Organizations API Endpoints", () => {
  let testCountryId: string;
  let testCityId: string;
  let createdOrgId1: string;
  let createdOrgId2: string;

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

    testCountryId = Math.random().toString(36).substring(2, 4).toUpperCase();
    testCityId = randomUUID();

    // Insert mock country
    await database
      .insertInto("countries")
      .values({
        iso_code: testCountryId,
        name: "Test Country for Org",
        serial_number: `CNT-${testCountryId}`,
        updated_at: new Date(),
      })
      .execute();

    // Insert mock city
    await database
      .insertInto("cities")
      .values({
        id: testCityId,
        name: "Test City for Org",
        serial_number: `CTY-${testCountryId}`,
        country_id: testCountryId,
        currency: "USD",
        updated_at: new Date(),
      })
      .execute();

    // Clean up the table because PGLite database is globally initialized with seed data
    await database.deleteFrom("organizations").execute();
  });

  after(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("ROLLBACK");
    }
  });

  describe("POST /organizations (Create)", () => {
    test("should throw ZodError when name is empty or missing", async () => {
      await assert.rejects(
        callProcedure(organizations.create, {
          name: "",
          slug: "test-org-01",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when slug is empty or missing", async () => {
      await assert.rejects(
        callProcedure(organizations.create, {
          name: "Test Org Name",
          slug: "   ",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create an organization", async () => {
      const result = await callProcedure(organizations.create, {
        name: "Open Source Foundation",
        slug: "open-source-foundation",
        serial_number: "ORG-01",
        subtype: "ASSOCIATION",
        ownership: "Public",
        mission: "Support open source initiatives",
        known_for: "Code hosting, Community events",
        project: "FOSS support",
        research_areas: ["Software engineering", "Open standards"],
        products: ["Hosting platform", "CLI tools"],
        services: ["Mentorship", "Funding"],
        budget: "$1,000,000",
        founded: "2010",
        founders: ["John Doe"],
        numberOfEmployees: "RANGE_11_50",
        city_id: testCityId,
      });

      assert.ok(result.id);
      assert.strictEqual(result.name, "Open Source Foundation");
      assert.strictEqual(result.slug, "open-source-foundation");
      assert.strictEqual(result.subtype, "ASSOCIATION");
      assert.strictEqual(result.city_id, testCityId);
      createdOrgId1 = result.id;
    });

    test("should throw CONFLICT when creating an organization with an existing slug", async () => {
      await assert.rejects(
        callProcedure(organizations.create, {
          name: "Duplicate Slug Org",
          slug: "open-source-foundation",
          serial_number: "ORG-01-DUP",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second organization", async () => {
      const result = await callProcedure(organizations.create, {
        name: "Cyber Security Agency",
        slug: "cyber-security-agency",
        serial_number: "ORG-02",
        subtype: "GOVERNMENT",
      });

      assert.ok(result.id);
      assert.strictEqual(result.subtype, "GOVERNMENT");
      createdOrgId2 = result.id;
    });
  });

  describe("GET /organizations (GetAll)", () => {
    test("should successfully return all non-deleted organizations", async () => {
      const results = await callProcedure(organizations.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should search organizations by name or mission query", async () => {
      const results = await callProcedure(organizations.getAll, {
        name: "initiatives",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdOrgId1);
    });

    test("should filter organizations by type", async () => {
      const results = await callProcedure(organizations.getAll, {
        subtype: "GOVERNMENT",
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdOrgId2);
    });
  });

  describe("GET /organizations/{organizationId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(organizations.getById, {
          organizationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the organization by its ID", async () => {
      const result = await callProcedure(organizations.getById, {
        organizationId: createdOrgId1,
      });

      assert.strictEqual(result.id, createdOrgId1);
      assert.strictEqual(result.name, "Open Source Foundation");
    });
  });

  describe("PATCH /organizations/{organizationId} (Update)", () => {
    test("should successfully update organization fields", async () => {
      const result = await callProcedure(organizations.update, {
        organizationId: createdOrgId1,
        name: "Global Open Source Foundation",
        budget: "$2,000,000",
      });

      assert.strictEqual(result.id, createdOrgId1);
      assert.strictEqual(result.name, "Global Open Source Foundation");
      assert.strictEqual(result.budget, "$2,000,000");
    });
  });

  describe("DELETE /organizations/{organizationId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(organizations.delete, {
          organizationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete an organization by ID", async () => {
      await callProcedure(organizations.delete, {
        organizationId: createdOrgId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(organizations.getById, {
          organizationId: createdOrgId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(organizations.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdOrgId2));

      createdOrgId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /organizations (DeleteBulk)", () => {
    test("should successfully bulk soft delete organizations", async () => {
      // Create another one to test bulk delete
      const extra = await callProcedure(organizations.create, {
        name: "Temporary organization to delete",
        slug: "temp-org-del",
        serial_number: "ORG-03",
      });

      const idsToDelete = [createdOrgId1, extra.id];

      await callProcedure(organizations.deleteBulk, {
        organizationIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(organizations.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdOrgId1));
      assert.ok(!remainingIds.includes(extra.id));

      createdOrgId1 = ""; // Mark as cleaned up
    });
  });
});
