process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { user_sessions } from "../routes/user_sessions";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("UserSessions API Endpoints", { concurrency: 1 }, () => {
  let testUserId: string;
  let createdSessionId1: string;
  let createdSessionId2: string;

  before(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("BEGIN");
    }

    

    testUserId = randomUUID();
    await database
      .insertInto("users")
      .values({
        id: testUserId,
        email: `sessions-test-${testUserId}@bildyx.com`,
        password_hash: "test_hash",
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("ROLLBACK");
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  describe("POST /sessions (Create)", () => {
    test("should throw NOT_FOUND when user does not exist", async () => {
      await assert.rejects(
        callProcedure(user_sessions.create, {
          user_id: randomUUID(),
          token_hash: "some_token_hash",
          expires_at: new Date(Date.now() + 86400000),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create a session", async () => {
      const expiresAt = new Date(Date.now() + 86400000);
      const res = await callProcedure(user_sessions.create, {
        user_id: testUserId,
        token_hash: "token_hash_abc_123",
        expires_at: expiresAt,
        ip_address: "127.0.0.1",
        user_agent: "TestAgent/1.0",
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_id, testUserId);
      assert.strictEqual(res.token_hash, "token_hash_abc_123");
      createdSessionId1 = res.id;
    });

    test("should successfully create a second session", async () => {
      const res = await callProcedure(user_sessions.create, {
        user_id: testUserId,
        token_hash: "token_hash_def_456",
        expires_at: new Date(Date.now() + 86400000),
      });

      assert.ok(res.id);
      createdSessionId2 = res.id;
    });
  });

  describe("GET /users/{userId}/sessions (GetByUser)", () => {
    test("should throw NOT_FOUND when user does not exist", async () => {
      await assert.rejects(
        callProcedure(user_sessions.getByUser, { userId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return sessions of the user", async () => {
      const res = await callProcedure(user_sessions.getByUser, {
        userId: testUserId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((s: any) => s.id);
      assert.ok(ids.includes(createdSessionId1));
      assert.ok(ids.includes(createdSessionId2));
    });
  });

  describe("GET /sessions/{sessionId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_sessions.getById, { sessionId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the session by its ID", async () => {
      const res = await callProcedure(user_sessions.getById, {
        sessionId: createdSessionId1,
      });
      assert.strictEqual(res.id, createdSessionId1);
      assert.strictEqual(res.token_hash, "token_hash_abc_123");
    });
  });

  describe("PATCH /sessions/{sessionId} (Revoke)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_sessions.revoke, { sessionId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully revoke a session", async () => {
      const res = await callProcedure(user_sessions.revoke, {
        sessionId: createdSessionId1,
      });

      assert.strictEqual(res.id, createdSessionId1);
      assert.ok(res.revoked_at !== null);
    });
  });

  describe("DELETE /sessions/{sessionId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_sessions.delete, { sessionId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a session by ID", async () => {
      const res = await callProcedure(user_sessions.delete, {
        sessionId: createdSessionId1,
      });

      assert.strictEqual(res.id, createdSessionId1);
      createdSessionId1 = "";
    });
  });

  describe("DELETE /sessions (DeleteBulk)", () => {
    test("should successfully bulk delete sessions by IDs", async () => {
      const res = await callProcedure(user_sessions.deleteBulk, {
        sessionIds: [createdSessionId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdSessionId2);
      createdSessionId2 = "";
    });
  });
});
