process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { auth } from "../routes/auth";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { createHash } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Authentication API Endpoints", { concurrency: 1 }, () => {
  let seekerEmail = "seeker@test.bildyx.com";
  let companyEmail = "company@test.bildyx.com";
  let seekerVerificationCode: string;
  let companyVerificationCode: string;
  let companyResetToken: string;

  before(async () => {
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);
    }
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

  describe("POST /auth/signup (Sign Up)", () => {
    test("should successfully register a Job Seeker Candidate", async () => {
      const res = await callProcedure(auth.signup, {
        accountType: "seeker",
        email: seekerEmail,
        password: "securepassword123",
        firstName: "Jean",
        lastName: "Dupont",
      });

      assert.strictEqual(res.email, seekerEmail);
      assert.ok(res.verification_code);
      seekerVerificationCode = res.verification_code;

      // Verify DB entries
      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", seekerEmail)
        .executeTakeFirst();

      assert.ok(user);
      assert.strictEqual(user.role, "CANDIDATE");
      assert.strictEqual(user.status, "PENDING_VERIFICATION");
      assert.strictEqual(user.email_verified, false);

      const profile = await database
        .selectFrom("user_profiles")
        .selectAll()
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      assert.ok(profile);
    });

    test("should successfully register a Company Organization", async () => {
      const res = await callProcedure(auth.signup, {
        accountType: "company",
        email: companyEmail,
        password: "securepassword456",
        companyName: "MayGraph Inc.",
      });

      assert.strictEqual(res.email, companyEmail);
      assert.ok(res.verification_code);
      companyVerificationCode = res.verification_code;

      // Verify DB entries
      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", companyEmail)
        .executeTakeFirst();

      assert.ok(user);
      assert.strictEqual(user.role, "ORGANIZATION");
      assert.strictEqual(user.status, "PENDING_VERIFICATION");
      assert.ok(user.organization_id);

      const org = await database
        .selectFrom("organizations")
        .selectAll()
        .where("id", "=", user.organization_id)
        .executeTakeFirst();

      assert.ok(org);
      assert.strictEqual(org.name, "MayGraph Inc.");
      assert.strictEqual(org.slug, "maygraph-inc");
    });

    test("should throw CONFLICT when email is already registered", async () => {
      await assert.rejects(
        callProcedure(auth.signup, {
          accountType: "seeker",
          email: seekerEmail,
          password: "anotherpassword",
          firstName: "Jean",
          lastName: "Dupont",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });

    test("should throw ZodError when company name is too short", async () => {
      await assert.rejects(
        callProcedure(auth.signup, {
          accountType: "company",
          email: "anotherorg@test.com",
          password: "password123",
          companyName: "Ab",
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw BAD_REQUEST when company name is missing", async () => {
      await assert.rejects(
        callProcedure(auth.signup, {
          accountType: "company",
          email: "anotherorg2@test.com",
          password: "password123",
        }),
        (err: any) => err instanceof ORPCError && err.code === "BAD_REQUEST",
      );
    });
  });

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

  describe("POST /auth/forgot-password (Forgot Password)", () => {
    test("should throw NOT_FOUND for non-existent email", async () => {
      await assert.rejects(
        callProcedure(auth.forgotPassword, {
          email: "nonexistent@test.com",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully request password reset and set reset token in DB", async () => {
      const res = await callProcedure(auth.forgotPassword, {
        email: companyEmail,
      });

      assert.ok(res.reset_token);
      companyResetToken = res.reset_token;

      const user = await database
        .selectFrom("users")
        .select(["reset_token", "reset_expires_at"])
        .where("email", "=", companyEmail)
        .executeTakeFirst();

      assert.ok(user);
      assert.strictEqual(user.reset_token, companyResetToken);
      assert.ok(user.reset_expires_at);
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
});
