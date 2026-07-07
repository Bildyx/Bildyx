process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { user_profiles } from "../routes/user_profiles";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("UserProfiles API Endpoints", { concurrency: 1 }, () => {
  let testUserId1: string;
  let testUserId2: string;
  let createdProfileId1: string;
  let createdProfileId2: string;

  before(async () => {
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);
    }

    testUserId1 = randomUUID();
    testUserId2 = randomUUID();

    await database
      .insertInto("users")
      .values([
        {
          id: testUserId1,
          email: `profiles-test-1-${testUserId1}@bildyx.com`,
          password_hash: "hash1",
          updated_at: new Date(),
        },
        {
          id: testUserId2,
          email: `profiles-test-2-${testUserId2}@bildyx.com`,
          password_hash: "hash2",
          updated_at: new Date(),
        },
      ])
      .execute();
  });

  after(async () => {
    try {
      const profileIds = [createdProfileId1, createdProfileId2].filter(Boolean);
      if (profileIds.length > 0) {
        await database
          .deleteFrom("user_profiles")
          .where("id", "in", profileIds)
          .execute();
      }
      await database
        .deleteFrom("users")
        .where("id", "in", [testUserId1, testUserId2])
        .execute();
    } catch (err) {
      console.error("Cleanup error in test teardown:", err);
    } finally {
      await database.destroy();
      if (pgliteClient) {
        await pgliteClient.close();
      }
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  describe("POST /profiles (Create)", () => {
    test("should throw ZodError when user_id is missing", async () => {
      await assert.rejects(
        callProcedure(user_profiles.create, { biography: "Test bio" }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a user profile", async () => {
      const res = await callProcedure(user_profiles.create, {
        user_id: testUserId1,
        biography: "Software engineer with 5 years of experience",
        locale: "fr",
        is_public: true,
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_id, testUserId1);
      assert.strictEqual(
        res.biography,
        "Software engineer with 5 years of experience",
      );
      createdProfileId1 = res.id;
    });

    test("should successfully create a second user profile", async () => {
      const res = await callProcedure(user_profiles.create, {
        user_id: testUserId2,
        is_public: false,
      });

      assert.ok(res.id);
      createdProfileId2 = res.id;
    });

    test("should throw CONFLICT when profile for user already exists", async () => {
      await assert.rejects(
        callProcedure(user_profiles.create, {
          user_id: testUserId1,
          biography: "Duplicate",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });
  });

  describe("GET /profiles (GetAll)", () => {
    test("should successfully return all user profiles", async () => {
      const res = await callProcedure(user_profiles.getAll, {});
      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
    });

    test("should filter by userId", async () => {
      const res = await callProcedure(user_profiles.getAll, {
        userId: testUserId1,
      });
      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdProfileId1);
    });
  });

  describe("GET /profiles/{profileId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_profiles.getById, { profileId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the profile by its ID", async () => {
      const res = await callProcedure(user_profiles.getById, {
        profileId: createdProfileId1,
      });
      assert.strictEqual(res.id, createdProfileId1);
    });
  });

  describe("GET /users/{userId}/profile (GetByUser)", () => {
    test("should throw NOT_FOUND when profile does not exist", async () => {
      await assert.rejects(
        callProcedure(user_profiles.getByUser, { userId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the profile by user ID", async () => {
      const res = await callProcedure(user_profiles.getByUser, {
        userId: testUserId1,
      });
      assert.strictEqual(res.id, createdProfileId1);
      assert.strictEqual(res.user_id, testUserId1);
    });
  });

  describe("PATCH /profiles/{profileId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_profiles.update, {
          profileId: randomUUID(),
          biography: "Updated bio",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update the user profile", async () => {
      const res = await callProcedure(user_profiles.update, {
        profileId: createdProfileId1,
        biography: "Updated biography",
        linkedin_url: "https://linkedin.com/in/alice",
      });

      assert.strictEqual(res.id, createdProfileId1);
      assert.strictEqual(res.biography, "Updated biography");
      assert.strictEqual(res.linkedin_url, "https://linkedin.com/in/alice");
    });
  });

  describe("DELETE /profiles/{profileId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_profiles.delete, { profileId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a user profile by ID", async () => {
      const res = await callProcedure(user_profiles.delete, {
        profileId: createdProfileId1,
      });
      assert.strictEqual(res.id, createdProfileId1);
      createdProfileId1 = "";
    });
  });

  describe("DELETE /profiles (DeleteBulk)", () => {
    test("should successfully bulk delete user profiles by IDs", async () => {
      const res = await callProcedure(user_profiles.deleteBulk, {
        profileIds: [createdProfileId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdProfileId2);
      createdProfileId2 = "";
    });
  });
});
