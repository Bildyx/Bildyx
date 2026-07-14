process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { users } from "../routes/users";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";

describe("Users API Endpoints", () => {
  let createdUserId1: string;
  let createdUserId2: string;

  after(async () => {
    try {
      const ids = [createdUserId1, createdUserId2].filter(Boolean);
      if (ids.length > 0) {
        await database.deleteFrom("users").where("id", "in", ids).execute();
      }
    } catch (e) {
      console.warn("Cleanup error in test teardown:", e);
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  describe("POST /users (Create)", () => {
    test("should throw ZodError when email is missing", async () => {
      await assert.rejects(
        callProcedure(users.create, {
          password_hash: "hashed_password",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw ZodError when password_hash is missing", async () => {
      await assert.rejects(
        callProcedure(users.create, {
          email: "test@example.com",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should successfully create a user", async () => {
      const res = await callProcedure(users.create, {
        email: "user1@test.bildyx.com",
        password_hash: "hashed_password_1",
        first_name: "Alice",
        last_name: "Martin",
        role: "CANDIDATE",
        status: "ACTIVE",
      });

      assert.ok(res.id);
      assert.strictEqual(res.email, "user1@test.bildyx.com");
      assert.strictEqual(res.first_name, "Alice");
      createdUserId1 = res.id;
    });

    test("should successfully create a second user", async () => {
      const res = await callProcedure(users.create, {
        email: "user2@test.bildyx.com",
        password_hash: "hashed_password_2",
        role: "ADMIN",
        status: "ACTIVE",
      });

      assert.ok(res.id);
      assert.strictEqual(res.email, "user2@test.bildyx.com");
      createdUserId2 = res.id;
    });

    test("should throw CONFLICT when email already exists", async () => {
      await assert.rejects(
        callProcedure(users.create, {
          email: "user1@test.bildyx.com",
          password_hash: "another_hash",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });
  });

  describe("GET /users (GetAll)", () => {
    test("should successfully return all users", async () => {
      const res = await callProcedure(users.getAll, {});
      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
    });

    test("should filter users by email", async () => {
      const res = await callProcedure(users.getAll, { email: "user1" });
      assert.ok(Array.isArray(res));
      assert.ok(res.some((u: any) => u.id === createdUserId1));
    });

    test("should filter users by role", async () => {
      const res = await callProcedure(users.getAll, { role: "ADMIN" });
      assert.ok(Array.isArray(res));
      assert.ok(res.some((u: any) => u.id === createdUserId2));
    });
  });

  describe("GET /users/{userId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(users.getById, { userId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the user by its ID", async () => {
      const res = await callProcedure(users.getById, {
        userId: createdUserId1,
      });
      assert.strictEqual(res.id, createdUserId1);
      assert.strictEqual(res.email, "user1@test.bildyx.com");
    });
  });

  describe("PATCH /users/{userId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(users.update, {
          userId: randomUUID(),
          first_name: "Bob",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update the user", async () => {
      const res = await callProcedure(users.update, {
        userId: createdUserId1,
        first_name: "Alice Updated",
        display_name: "Alice M.",
      });

      assert.strictEqual(res.id, createdUserId1);
      assert.strictEqual(res.first_name, "Alice Updated");
      assert.strictEqual(res.display_name, "Alice M.");
    });
  });

  describe("DELETE /users/{userId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(users.delete, { userId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully soft delete a user by ID", async () => {
      await callProcedure(users.delete, { userId: createdUserId1 });

      await assert.rejects(
        callProcedure(users.getById, { userId: createdUserId1 }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      createdUserId1 = "";
    });
  });

  describe("DELETE /users (DeleteBulk)", () => {
    test("should successfully bulk delete users by IDs", async () => {
      await callProcedure(users.deleteBulk, {
        userIds: [createdUserId2],
      });

      await assert.rejects(
        callProcedure(users.getById, { userId: createdUserId2 }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );

      createdUserId2 = "";
    });
  });
});
