process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { user_educations } from "../routes/user_educations";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("UserEducations API Endpoints", { concurrency: 1 }, () => {
  let testUserId: string;
  let testProfileId: string;
  let createdEducationId1: string;
  let createdEducationId2: string;

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
        email: `educations-test-${testUserId}@bildyx.com`,
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
  });

  after(async () => {
    try {
      const ids = [createdEducationId1, createdEducationId2].filter(Boolean);
      if (ids.length > 0) {
        await database
          .deleteFrom("user_educations")
          .where("id", "in", ids)
          .execute();
      }
      await database
        .deleteFrom("user_profiles")
        .where("id", "=", testProfileId)
        .execute();
      await database.deleteFrom("users").where("id", "=", testUserId).execute();
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

  describe("POST /educations (Create)", () => {
    test("should throw ZodError when user_profile_id is missing", async () => {
      await assert.rejects(
        callProcedure(user_educations.create, {
          start_year: 2018,
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw NOT_FOUND when profile does not exist", async () => {
      await assert.rejects(
        callProcedure(user_educations.create, {
          user_profile_id: randomUUID(),
          start_year: 2018,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create a user education", async () => {
      const res = await callProcedure(user_educations.create, {
        user_profile_id: testProfileId,
        start_year: 2018,
        end_year: 2022,
        graduated: true,
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_profile_id, testProfileId);
      assert.strictEqual(res.start_year, 2018);
      assert.strictEqual(res.graduated, true);
      createdEducationId1 = res.id;
    });

    test("should successfully create a second user education", async () => {
      const res = await callProcedure(user_educations.create, {
        user_profile_id: testProfileId,
        start_year: 2015,
        end_year: 2018,
        graduated: true,
      });

      assert.ok(res.id);
      createdEducationId2 = res.id;
    });
  });

  describe("GET /profiles/{userProfileId}/educations (GetByProfile)", () => {
    test("should throw NOT_FOUND when profile does not exist", async () => {
      await assert.rejects(
        callProcedure(user_educations.getByProfile, {
          userProfileId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return educations of the profile", async () => {
      const res = await callProcedure(user_educations.getByProfile, {
        userProfileId: testProfileId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((e: any) => e.id);
      assert.ok(ids.includes(createdEducationId1));
      assert.ok(ids.includes(createdEducationId2));
    });
  });

  describe("GET /educations/{educationId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_educations.getById, { educationId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the education by its ID", async () => {
      const res = await callProcedure(user_educations.getById, {
        educationId: createdEducationId1,
      });
      assert.strictEqual(res.id, createdEducationId1);
    });
  });

  describe("PATCH /educations/{educationId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_educations.update, {
          educationId: randomUUID(),
          end_year: 2023,
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update the user education", async () => {
      const res = await callProcedure(user_educations.update, {
        educationId: createdEducationId1,
        end_year: 2023,
        graduated: false,
      });

      assert.strictEqual(res.id, createdEducationId1);
      assert.strictEqual(res.end_year, 2023);
      assert.strictEqual(res.graduated, false);
    });
  });

  describe("DELETE /educations/{educationId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_educations.delete, { educationId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a user education by ID", async () => {
      const res = await callProcedure(user_educations.delete, {
        educationId: createdEducationId1,
      });
      assert.strictEqual(res.id, createdEducationId1);
      createdEducationId1 = "";
    });
  });

  describe("DELETE /educations (DeleteBulk)", () => {
    test("should successfully bulk delete user educations by IDs", async () => {
      const res = await callProcedure(user_educations.deleteBulk, {
        educationIds: [createdEducationId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdEducationId2);
      createdEducationId2 = "";
    });
  });
});
