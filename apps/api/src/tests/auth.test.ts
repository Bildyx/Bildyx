process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { auth } from "../routes/auth";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { createHash, randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashPassword } from "../services/auth.service";
import { generateSerialNumber } from "../models/utils/enums.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Authentication API Endpoints", { concurrency: 1 }, () => {
  let seekerEmail = "seeker@test.bildyx.com";
  let companyEmail = "company@test.bildyx.com";
  let seekerVerificationCode = "123456";
  let companyVerificationCode = "654321";
  let companyResetToken = "999999";

  before(async () => {
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);
    }

    // Insert test users directly in DB to avoid calling signup routes (which trigger emails)
    const seekerId = randomUUID();
    const companyId = randomUUID();
    const orgId = randomUUID();

    // 1. Insert organization
    await database
      .insertInto("organizations")
      .values({
        id: orgId,
        name: "MayGraph Inc.",
        slug: "maygraph-inc",
        serial_number: generateSerialNumber("COMPANY"),
        updated_at: new Date(),
      })
      .execute();

    // 2. Insert seeker user (unverified)
    await database
      .insertInto("users")
      .values({
        id: seekerId,
        email: seekerEmail,
        password_hash: hashPassword("securepassword123"),
        email_verified: false,
        role: "CANDIDATE",
        status: "PENDING_VERIFICATION",
        verification_code: seekerVerificationCode,
        verification_expires_at: new Date(Date.now() + 60 * 60 * 1000),
        last_verification_sent_at: new Date(),
        first_name: "Jean",
        last_name: "Dupont",
        display_name: "Jean Dupont",
        marketing_opt_in: false,
        updated_at: new Date(),
      })
      .execute();

    // 3. Insert user profile for seeker
    await database
      .insertInto("user_profiles")
      .values({
        id: randomUUID(),
        user_id: seekerId,
        is_public: true,
        updated_at: new Date(),
      })
      .execute();

    // 4. Insert company user (unverified)
    await database
      .insertInto("users")
      .values({
        id: companyId,
        email: companyEmail,
        password_hash: hashPassword("securepassword456"),
        email_verified: false,
        role: "ORGANIZATION",
        status: "PENDING_VERIFICATION",
        verification_code: companyVerificationCode,
        verification_expires_at: new Date(Date.now() + 60 * 60 * 1000),
        last_verification_sent_at: new Date(),
        organization_id: orgId,
        marketing_opt_in: false,
        updated_at: new Date(),
      })
      .execute();
  });

  after(async () => {
    try {
      // Clean up tests
      await database.deleteFrom("user_sessions").execute();
      await database.deleteFrom("user_profiles").execute();
      await database.deleteFrom("users").execute();
      await database.deleteFrom("organizations").execute();
    } catch (err) {
      console.error("Cleanup error in auth test teardown:", err);
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

  describe("POST /auth/verify-email (Email Verification)", () => {
    test("should throw BAD_REQUEST when verification code is incorrect", async () => {
      await assert.rejects(
        callProcedure(auth.verifyEmail, {
          email: seekerEmail,
          code: "000000",
        }),
        (err: any) => err instanceof ORPCError && err.code === "BAD_REQUEST",
      );
    });

    test("should successfully verify email and return session token", async () => {
      const res = await callProcedure(auth.verifyEmail, {
        email: seekerEmail,
        code: seekerVerificationCode,
      });

      assert.ok(res.token);
      assert.ok(res.user);
      assert.strictEqual(res.user.email, seekerEmail);
      assert.strictEqual(res.user.role, "CANDIDATE");

      // Verify status in DB is active
      const user = await database
        .selectFrom("users")
        .select(["email_verified", "status"])
        .where("email", "=", seekerEmail)
        .executeTakeFirst();

      assert.ok(user);
      assert.strictEqual(user.email_verified, true);
      assert.strictEqual(user.status, "ACTIVE");
    });
  });

  describe("POST /auth/login (Login)", () => {
    test("should throw FORBIDDEN when user email is not yet verified", async () => {
      await assert.rejects(
        callProcedure(auth.login, {
          email: companyEmail,
          password: "securepassword456",
        }),
        (err: any) => err instanceof ORPCError && err.code === "FORBIDDEN",
      );
    });

    test("should throw UNAUTHORIZED for wrong credentials", async () => {
      // Let's verify company first to activate it
      await callProcedure(auth.verifyEmail, {
        email: companyEmail,
        code: companyVerificationCode,
      });

      await assert.rejects(
        callProcedure(auth.login, {
          email: companyEmail,
          password: "wrongpassword",
        }),
        (err: any) => err instanceof ORPCError && err.code === "UNAUTHORIZED",
      );
    });

    test("should successfully login with correct credentials and return session", async () => {
      const res = await callProcedure(auth.login, {
        email: companyEmail,
        password: "securepassword456",
      });

      assert.ok(res.token);
      assert.strictEqual(res.user.email, companyEmail);
      assert.strictEqual(res.user.role, "ORGANIZATION");

      // Verify session exists in DB
      const tokenHash = createHash("sha256").update(res.token).digest("hex");
      const session = await database
        .selectFrom("user_sessions")
        .selectAll()
        .where("token_hash", "=", tokenHash)
        .executeTakeFirst();

      assert.ok(session);
      assert.strictEqual(session.user_id, res.user.id);
    });
  });

  describe("POST /auth/reset-password (Reset Password)", () => {
    test("should throw BAD_REQUEST with invalid reset token", async () => {
      await assert.rejects(
        callProcedure(auth.resetPassword, {
          email: companyEmail,
          token: "000000",
          password: "newsecurepassword789",
        }),
        (err: any) => err instanceof ORPCError && err.code === "BAD_REQUEST",
      );
    });

    test("should successfully reset password", async () => {
      // Set reset token directly in DB to bypass the forgotPassword endpoint (which sends emails)
      await database
        .updateTable("users")
        .set({
          reset_token: companyResetToken,
          reset_expires_at: new Date(Date.now() + 60 * 60 * 1000),
        })
        .where("email", "=", companyEmail)
        .execute();

      const res = await callProcedure(auth.resetPassword, {
        email: companyEmail,
        token: companyResetToken,
        password: "newsecurepassword789",
      });

      assert.strictEqual(res.message, "Password successfully updated.");

      // Check reset token was cleared in DB
      const user = await database
        .selectFrom("users")
        .select(["reset_token", "password_changed_at"])
        .where("email", "=", companyEmail)
        .executeTakeFirst();

      assert.ok(user);
      assert.strictEqual(user.reset_token, null);
      assert.ok(user.password_changed_at);

      // Verify login works with the new password
      const loginRes = await callProcedure(auth.login, {
        email: companyEmail,
        password: "newsecurepassword789",
      });
      assert.ok(loginRes.token);
    });
  });

  describe("POST /auth/logout (Logout)", () => {
    test("should successfully revoke session on logout", async () => {
      // Log in seeker
      const loginRes = await callProcedure(auth.login, {
        email: seekerEmail,
        password: "securepassword123",
      });

      assert.ok(loginRes.token);

      const tokenHash = createHash("sha256").update(loginRes.token).digest("hex");

      const sessionBefore = await database
        .selectFrom("user_sessions")
        .select("revoked_at")
        .where("token_hash", "=", tokenHash)
        .executeTakeFirst();

      assert.ok(sessionBefore);
      assert.strictEqual(sessionBefore.revoked_at, null);

      // Logout
      const logoutRes = await callProcedure(auth.logout, {
        token: loginRes.token,
      });

      assert.strictEqual(logoutRes.message, "Successfully logged out");

      const sessionAfter = await database
        .selectFrom("user_sessions")
        .select("revoked_at")
        .where("token_hash", "=", tokenHash)
        .executeTakeFirst();

      assert.ok(sessionAfter);
      assert.ok(sessionAfter.revoked_at);
    });
  });
});
