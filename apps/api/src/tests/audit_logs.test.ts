process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { audit_logs } from "../routes/audit_logs";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("AuditLogs API Endpoints", { concurrency: 1 }, () => {
  let testUserId: string;
  let createdLogId1: string;
  let createdLogId2: string;

  before(async () => {
    if (pgliteClient) {
      await pgliteClient.exec("BEGIN");
    }

    

    testUserId = randomUUID();
    await database
      .insertInto("users")
      .values({
        id: testUserId,
        email: `audit-test-${testUserId}@bildyx.com`,
        password_hash: "hash",
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

  describe("POST /audit-logs (Create)", () => {
    test("should throw ZodError when user_id is missing", async () => {
      await assert.rejects(
        callProcedure(audit_logs.create, { action: "LOGIN" }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when action is missing", async () => {
      await assert.rejects(
        callProcedure(audit_logs.create, { user_id: testUserId }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw NOT_FOUND when user does not exist", async () => {
      await assert.rejects(
        callProcedure(audit_logs.create, {
          user_id: randomUUID(),
          action: "LOGIN",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create an audit log", async () => {
      const res = await callProcedure(audit_logs.create, {
        user_id: testUserId,
        action: "LOGIN",
        ip_address: "192.168.1.1",
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_id, testUserId);
      assert.strictEqual(res.action, "LOGIN");
      assert.strictEqual(res.ip_address, "192.168.1.1");
      createdLogId1 = res.id;
    });

    test("should successfully create a second audit log", async () => {
      const res = await callProcedure(audit_logs.create, {
        user_id: testUserId,
        action: "PASSWORD_CHANGE",
      });

      assert.ok(res.id);
      createdLogId2 = res.id;
    });
  });

  describe("GET /audit-logs (GetAll)", () => {
    test("should successfully return all audit logs", async () => {
      const res = await callProcedure(audit_logs.getAll, {});
      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
    });

    test("should filter by userId", async () => {
      const res = await callProcedure(audit_logs.getAll, {
        userId: testUserId,
      });
      assert.ok(Array.isArray(res));
      assert.ok(res.some((l: any) => l.id === createdLogId1));
    });

    test("should filter by action", async () => {
      const res = await callProcedure(audit_logs.getAll, { action: "LOGIN" });
      assert.ok(Array.isArray(res));
      assert.ok(res.some((l: any) => l.id === createdLogId1));
    });
  });

  describe("GET /users/{userId}/audit-logs (GetByUser)", () => {
    test("should throw NOT_FOUND when user does not exist", async () => {
      await assert.rejects(
        callProcedure(audit_logs.getByUser, { userId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return audit logs of the user", async () => {
      const res = await callProcedure(audit_logs.getByUser, {
        userId: testUserId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((l: any) => l.id);
      assert.ok(ids.includes(createdLogId1));
      assert.ok(ids.includes(createdLogId2));
    });
  });

  describe("GET /audit-logs/{auditLogId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(audit_logs.getById, { auditLogId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the audit log by its ID", async () => {
      const res = await callProcedure(audit_logs.getById, {
        auditLogId: createdLogId1,
      });
      assert.strictEqual(res.id, createdLogId1);
      assert.strictEqual(res.action, "LOGIN");
    });
  });

  describe("DELETE /audit-logs/{auditLogId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(audit_logs.delete, { auditLogId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete an audit log by ID", async () => {
      const res = await callProcedure(audit_logs.delete, {
        auditLogId: createdLogId1,
      });
      assert.strictEqual(res.id, createdLogId1);
      createdLogId1 = "";
    });
  });

  describe("DELETE /audit-logs (DeleteBulk)", () => {
    test("should successfully bulk delete audit logs by IDs", async () => {
      const res = await callProcedure(audit_logs.deleteBulk, {
        auditLogIds: [createdLogId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdLogId2);
      createdLogId2 = "";
    });
  });
});
