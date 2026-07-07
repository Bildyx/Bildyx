process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { user_certifications } from "../routes/user_certifications";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("UserCertifications API Endpoints", () => {
  let testUserId: string;
  let testProfileId: string;
  let testOrgId: string;
  let testCertificationId1: string;
  let testCertificationId2: string;
  let createdUserCertId1: string;
  let createdUserCertId2: string;

  before(async () => {
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);
    }

    testUserId = randomUUID();
    await database
      .insertInto("users")
      .values({
        id: testUserId,
        email: `user-certs-test-${testUserId}@bildyx.com`,
        password_hash: "hash",
        updated_at: new Date(),
      })
      .execute();

    testProfileId = randomUUID();
    await database
      .insertInto("user_profiles")
      .values({
        id: testProfileId,
        user_id: testUserId,
        updated_at: new Date(),
      })
      .execute();

    testOrgId = randomUUID();
    await database
      .insertInto("organizations")
      .values({
        id: testOrgId,
        name: "Test Org for UserCerts",
        slug: `test-org-user-certs-${testOrgId}`,
        updated_at: new Date(),
      })
      .execute();

    testCertificationId1 = randomUUID();
    testCertificationId2 = randomUUID();
    await database
      .insertInto("certifications")
      .values([
        {
          id: testCertificationId1,
          name: "AWS Developer",
          serial_number: `aws-dev-${testCertificationId1}`,
          updated_at: new Date(),
        },
        {
          id: testCertificationId2,
          name: "PMP",
          serial_number: `pmp-${testCertificationId2}`,
          updated_at: new Date(),
        },
      ])
      .execute();
  });

  after(async () => {
    try {
      const ids = [createdUserCertId1, createdUserCertId2].filter(Boolean);
      if (ids.length > 0) {
        await database
          .deleteFrom("user_certifications")
          .where("id", "in", ids)
          .execute();
      }
      await database
        .deleteFrom("certifications")
        .where("id", "in", [testCertificationId1, testCertificationId2])
        .execute();
      await database
        .deleteFrom("user_profiles")
        .where("id", "=", testProfileId)
        .execute();
      await database.deleteFrom("users").where("id", "=", testUserId).execute();
      await database
        .deleteFrom("organizations")
        .where("id", "=", testOrgId)
        .execute();
    } catch (err) {
      console.error("Cleanup error in test teardown:", err);
    } finally {
      await database.destroy();
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  describe("POST /user-certifications (Create)", () => {
    test("should throw ZodError when certification_id is missing", async () => {
      await assert.rejects(
        callProcedure(user_certifications.create, {
          user_profile_id: testProfileId,
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw NOT_FOUND when profile does not exist", async () => {
      await assert.rejects(
        callProcedure(user_certifications.create, {
          user_profile_id: randomUUID(),
          certification_id: testCertificationId1,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create a user certification", async () => {
      const obtainedAt = new Date("2023-01-01");
      const res = await callProcedure(user_certifications.create, {
        user_profile_id: testProfileId,
        certification_id: testCertificationId1,
        obtained_at: obtainedAt,
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_profile_id, testProfileId);
      assert.strictEqual(res.certification_id, testCertificationId1);
      createdUserCertId1 = res.id;
    });

    test("should successfully create a second user certification", async () => {
      const res = await callProcedure(user_certifications.create, {
        user_profile_id: testProfileId,
        certification_id: testCertificationId2,
      });

      assert.ok(res.id);
      createdUserCertId2 = res.id;
    });

    test("should throw CONFLICT when certification is already linked", async () => {
      await assert.rejects(
        callProcedure(user_certifications.create, {
          user_profile_id: testProfileId,
          certification_id: testCertificationId1,
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });
  });

  describe("GET /profiles/{userProfileId}/certifications (GetByProfile)", () => {
    test("should throw NOT_FOUND when profile does not exist", async () => {
      await assert.rejects(
        callProcedure(user_certifications.getByProfile, {
          userProfileId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return certifications of the profile", async () => {
      const res = await callProcedure(user_certifications.getByProfile, {
        userProfileId: testProfileId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((c: any) => c.id);
      assert.ok(ids.includes(createdUserCertId1));
      assert.ok(ids.includes(createdUserCertId2));
    });
  });

  describe("GET /user-certifications/{userCertificationId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_certifications.getById, {
          userCertificationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the user certification by its ID", async () => {
      const res = await callProcedure(user_certifications.getById, {
        userCertificationId: createdUserCertId1,
      });
      assert.strictEqual(res.id, createdUserCertId1);
    });
  });

  describe("PATCH /user-certifications/{userCertificationId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_certifications.update, {
          userCertificationId: randomUUID(),
          expires_at: new Date("2025-01-01"),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update the user certification", async () => {
      const expiresAt = new Date("2025-12-31");
      const res = await callProcedure(user_certifications.update, {
        userCertificationId: createdUserCertId1,
        expires_at: expiresAt,
      });

      assert.strictEqual(res.id, createdUserCertId1);
      assert.ok(res.expires_at !== null);
    });
  });

  describe("DELETE /user-certifications/{userCertificationId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_certifications.delete, {
          userCertificationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a user certification by ID", async () => {
      const res = await callProcedure(user_certifications.delete, {
        userCertificationId: createdUserCertId1,
      });
      assert.strictEqual(res.id, createdUserCertId1);
      createdUserCertId1 = "";
    });
  });

  describe("DELETE /user-certifications (DeleteBulk)", () => {
    test("should successfully bulk delete user certifications by IDs", async () => {
      const res = await callProcedure(user_certifications.deleteBulk, {
        userCertificationIds: [createdUserCertId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdUserCertId2);
      createdUserCertId2 = "";
    });
  });
});
