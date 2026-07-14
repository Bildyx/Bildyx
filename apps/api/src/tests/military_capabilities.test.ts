import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { military_capabilities } from "../routes/military_capabilities";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("Military Capabilities API Endpoints", () => {
  let testOrgId1: string;
  let testOrgId2: string;
  let createdCapabilityId1: string;
  let createdCapabilityId2: string;

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

    testOrgId1 = randomUUID();
    testOrgId2 = randomUUID();

    // Insert mock organizations
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId1,
        name: "Test Org 1 for Military Capabilities",
        slug: "test-org-1-mil-slug",
        updated_at: new Date(),
      })
      .execute();

    await database
      .insertInto("organizations")
      .values({
        id: testOrgId2,
        name: "Test Org 2 for Military Capabilities",
        slug: "test-org-2-mil-slug",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("ROLLBACK");
    }
  });

  describe("POST /military-capabilities (Create)", () => {
    test("should throw ZodError when organization_id is invalid", async () => {
      await assert.rejects(
        callProcedure(military_capabilities.create, {
          organization_id: "not-a-uuid",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw NOT_FOUND when organization does not exist", async () => {
      await assert.rejects(
        callProcedure(military_capabilities.create, {
          organization_id: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create military capability record", async () => {
      const result = await callProcedure(military_capabilities.create, {
        organization_id: testOrgId1,
        number_of_active_navy_personnel: 5000,
        number_of_aircrafts: 150,
        number_of_destroyers: 12,
      });

      assert.ok(result.id);
      assert.strictEqual(result.organization_id, testOrgId1);
      assert.strictEqual(result.number_of_active_navy_personnel, 5000);
      assert.strictEqual(result.number_of_aircrafts, 150);
      assert.strictEqual(result.number_of_destroyers, 12);
      createdCapabilityId1 = result.id;
    });

    test("should throw CONFLICT when creating a record for the same organization", async () => {
      await assert.rejects(
        callProcedure(military_capabilities.create, {
          organization_id: testOrgId1,
          number_of_aircrafts: 10,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should successfully create a second record for another organization", async () => {
      const result = await callProcedure(military_capabilities.create, {
        organization_id: testOrgId2,
        number_of_active_navy_personnel: 2000,
      });

      assert.ok(result.id);
      assert.strictEqual(result.organization_id, testOrgId2);
      createdCapabilityId2 = result.id;
    });
  });

  describe("GET /military-capabilities (GetAll)", () => {
    test("should successfully return all records", async () => {
      const results = await callProcedure(military_capabilities.getAll, {});

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 2);
    });

    test("should filter records by organization_id", async () => {
      const results = await callProcedure(military_capabilities.getAll, {
        organization_id: testOrgId1,
      });

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, createdCapabilityId1);
    });
  });

  describe("GET /military-capabilities/{militaryCapabilityId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(military_capabilities.getById, {
          militaryCapabilityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the record by its ID", async () => {
      const result = await callProcedure(military_capabilities.getById, {
        militaryCapabilityId: createdCapabilityId1,
      });

      assert.strictEqual(result.id, createdCapabilityId1);
      assert.strictEqual(result.number_of_active_navy_personnel, 5000);
    });
  });

  describe("PATCH /military-capabilities/{militaryCapabilityId} (Update)", () => {
    test("should successfully update record fields", async () => {
      const result = await callProcedure(military_capabilities.update, {
        militaryCapabilityId: createdCapabilityId1,
        number_of_active_navy_personnel: 6000,
        number_of_drones: 50,
      });

      assert.strictEqual(result.id, createdCapabilityId1);
      assert.strictEqual(result.number_of_active_navy_personnel, 6000);
      assert.strictEqual(result.number_of_drones, 50);
    });
  });

  describe("DELETE /military-capabilities/{militaryCapabilityId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(military_capabilities.delete, {
          militaryCapabilityId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a record by ID", async () => {
      await callProcedure(military_capabilities.delete, {
        militaryCapabilityId: createdCapabilityId2,
      });

      // Verify no longer returned by getById
      await assert.rejects(
        callProcedure(military_capabilities.getById, {
          militaryCapabilityId: createdCapabilityId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      // Verify no longer returned in getAll
      const results = await callProcedure(military_capabilities.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdCapabilityId2));

      createdCapabilityId2 = ""; // Mark as cleaned up
    });
  });

  describe("DELETE /military-capabilities (DeleteBulk)", () => {
    test("should successfully bulk delete records", async () => {
      // Create another one to test bulk delete (since organization can only have one, we need to create a temporary org)
      const tempOrgId = randomUUID();
      await database
        .insertInto("organizations")
        .values({
          id: tempOrgId,
          name: "Temp Org for Bulk Delete",
          slug: "temp-org-bulk-slug",
          updated_at: new Date(),
        })
        .execute();

      const extra = await callProcedure(military_capabilities.create, {
        organization_id: tempOrgId,
        number_of_aircrafts: 5,
      });

      const idsToDelete = [createdCapabilityId1, extra.id];

      await callProcedure(military_capabilities.deleteBulk, {
        militaryCapabilityIds: idsToDelete,
      });

      // Verify they are no longer returned in getAll
      const results = await callProcedure(military_capabilities.getAll, {});
      const remainingIds = results.map((r: any) => r.id);
      assert.ok(!remainingIds.includes(createdCapabilityId1));
      assert.ok(!remainingIds.includes(extra.id));

      // Clean up temp organization
      await database
        .deleteFrom("organizations")
        .where("id", "=", tempOrgId)
        .execute();

      createdCapabilityId1 = ""; // Mark as cleaned up
    });
  });
});
