import { ORPCError } from "@orpc/server";
import passport from "passport";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { z } from "zod";
import {
  SignupInputSchema,
  SignupOutputSchema,
  LoginInputSchema,
  LoginOutputSchema,
  VerifyEmailInputSchema,
  VerifyEmailOutputSchema,
  ForgotPasswordInputSchema,
  ForgotPasswordOutputSchema,
  ResetPasswordInputSchema,
  ResetPasswordOutputSchema,
  ResendVerificationInputSchema,
  ResendVerificationOutputSchema,
  LogoutInputSchema,
  LogoutOutputSchema,
  CancelUnverifiedInputSchema,
  CancelUnverifiedOutputSchema,
} from "../models/auth";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import {
  generateSerialNumber,
  OrganizationSubtypeEnum,
} from "../models/utils/enums.js";
import {
  hashPassword,
  verifyPassword,
  parseDbDate,
  getLoginUrl,
} from "../services/auth.service";
import {
  sendVerificationEmail,
  sendResetEmail,
} from "../services/mail.service";
import { FRONTEND_URL } from "../configuration";

export const auth = {
  signup: publicProcedure
    .route({
      method: "POST",
      summary: "User registration",
      description:
        "Registers a new user (Seeker or Company) and creates initial profiles",
      path: "/auth/signup",
      tags: ["Auth"],
    })
    .input(SignupInputSchema)
    .output(SignupOutputSchema)
    .handler(async ({ input }) => {
      const emailLower = input.email.trim().toLowerCase();

      const existing = await database
        .selectFrom("users")
        .where("email", "=", emailLower)
        .select(["id", "email_verified", "verification_expires_at"])
        .executeTakeFirst();

      if (existing) {
        const expiredUnverified =
          !existing.email_verified &&
          existing.verification_expires_at &&
          parseDbDate(existing.verification_expires_at).getTime() < Date.now();

        if (expiredUnverified) {
          await database
            .deleteFrom("users")
            .where("id", "=", existing.id)
            .execute();
        } else {
          throw new ORPCError("CONFLICT", {
            message: "A user with this email already exists",
          });
        }
      }

      const userId = randomUUID();
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const verificationExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const passwordHash = hashPassword(input.password);

      await database.transaction().execute(async (trx) => {
        if (input.accountType === "company") {
          if (!input.companyName || !input.companyName.trim()) {
            throw new ORPCError("BAD_REQUEST", {
              message: "Company name is required for company accounts",
            });
          }
          let slug = input.companyName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

          if (!slug) slug = "company";

          const existingOrg = await trx
            .selectFrom("organizations")
            .where("slug", "=", slug)
            .select("id")
            .executeTakeFirst();

          if (existingOrg) {
            slug = `${slug}-${randomBytes(3).toString("hex")}`;
          }

          const orgId = randomUUID();
          await trx
            .insertInto("organizations")
            .values({
              id: orgId,
              name: input.companyName.trim(),
              slug: slug,
              subtype: OrganizationSubtypeEnum.enum.COMPANY,
              serial_number: generateSerialNumber(
                OrganizationSubtypeEnum.enum.COMPANY,
              ),
              profile_url: input.companyName
                .trim()
                .replace(" ", "-")
                .toLowerCase(),
            })
            .execute();

          await trx
            .insertInto("users")
            .values({
              id: userId,
              email: emailLower,
              password_hash: passwordHash,
              email_verified: false,
              role: "ORGANIZATION",
              status: "PENDING_VERIFICATION",
              verification_code: verificationCode,
              verification_expires_at: verificationExpiresAt,
              last_verification_sent_at: new Date(),
              organization_id: orgId,
              marketing_opt_in: input.marketing ?? false,
            })
            .execute();
        } else {
          if (
            !input.firstName ||
            !input.firstName.trim() ||
            !input.lastName ||
            !input.lastName.trim()
          ) {
            throw new ORPCError("BAD_REQUEST", {
              message:
                "First name and last name are required for seeker accounts",
            });
          }
          await trx
            .insertInto("users")
            .values({
              id: userId,
              email: emailLower,
              password_hash: passwordHash,
              email_verified: false,
              role: "CANDIDATE",
              status: "PENDING_VERIFICATION",
              verification_code: verificationCode,
              verification_expires_at: verificationExpiresAt,
              last_verification_sent_at: new Date(),
              marketing_opt_in: input.marketing ?? false,
            })
            .execute();
        }

        const profileValues: any = {
          id: randomUUID(),
          user_id: userId,
          is_public: true,
        };

        if (
          input.accountType === "seeker" &&
          input.firstName &&
          input.lastName
        ) {
          profileValues.first_name = input.firstName.trim();
          profileValues.last_name = input.lastName.trim();
          profileValues.display_name = `${input.firstName.trim()} ${input.lastName.trim()}`;
        }

        await trx.insertInto("user_profiles").values(profileValues).execute();
      });

      sendVerificationEmail(emailLower, verificationCode).catch((err) => {
        console.error(
          `[Signup] Failed to send verification email asynchronously: ${err?.message || String(err)}`,
        );
      });

      return {
        message: "Registration successful. Please verify your email.",
        email: emailLower,
        userId: userId,
        verification_code: verificationCode,
      };
    }),

  login: publicProcedure
    .route({
      method: "POST",
      summary: "User login",
      description: "Authenticates a user and starts a session",
      path: "/auth/login",
      tags: ["Auth"],
    })
    .input(LoginInputSchema)
    .output(LoginOutputSchema)
    .handler(async ({ input, context }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", emailLower)
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Invalid credentials",
        });
      }

      if (user.status === "PENDING_VERIFICATION") {
        if (
          user.verification_expires_at &&
          parseDbDate(user.verification_expires_at).getTime() < Date.now()
        ) {
          await database
            .deleteFrom("users")
            .where("id", "=", user.id)
            .execute();
          throw new ORPCError("BAD_REQUEST", {
            message:
              "Verification expired. Your account has been deleted. Please create a new account.",
          });
        }
        throw new ORPCError("FORBIDDEN", {
          message: "Please verify your email before logging in",
        });
      }

      if (user.status === "SUSPENDED") {
        throw new ORPCError("FORBIDDEN", {
          message: "Your account is suspended",
        });
      }

      const isValid = verifyPassword(input.password, user.password_hash);
      if (!isValid) {
        await database
          .updateTable("users")
          .set({ failed_login_attempts: user.failed_login_attempts + 1 })
          .where("id", "=", user.id)
          .execute();

        throw new ORPCError("UNAUTHORIZED", {
          message: "Invalid credentials",
        });
      }

      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await database
        .insertInto("user_sessions")
        .values({
          id: randomUUID(),
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        })
        .execute();

      await database
        .updateTable("users")
        .set({
          failed_login_attempts: 0,
          last_login_at: new Date(),
        })
        .where("id", "=", user.id)
        .execute();

      const ctx = context as any;
      if (ctx?.res) {
        const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
        const secureFlag = process.env.NODE_ENV === "production";
        ctx.res.cookie(cookieName, token, {
          httpOnly: true,
          secure: secureFlag,
          sameSite: "lax",
          expires: expiresAt,
        });
      }

      const userProfile = await database
        .selectFrom("user_profiles")
        .select(["id", "first_name", "last_name"])
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: userProfile?.first_name || null,
          last_name: userProfile?.last_name || null,
          role: user.role,
          profile_id: userProfile?.id || null,
          organization_id: user.organization_id || null,
        },
      };
    }),

  verifyEmail: publicProcedure
    .route({
      method: "POST",
      summary: "Verify signup email",
      description: "Verifies the email verification code sent during signup",
      path: "/auth/verify-email",
      tags: ["Auth"],
    })
    .input(VerifyEmailInputSchema)
    .output(VerifyEmailOutputSchema)
    .handler(async ({ input, context }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", emailLower)
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      if (user.email_verified && user.status === "ACTIVE") {
        return {
          message: "Email is already verified",
        };
      }

      if (user.verification_code !== input.code) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Incorrect verification code",
        });
      }

      if (
        user.verification_expires_at &&
        parseDbDate(user.verification_expires_at).getTime() < Date.now()
      ) {
        await database.deleteFrom("users").where("id", "=", user.id).execute();
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Verification expired. Your account has been deleted. Please create a new account.",
        });
      }

      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await database.transaction().execute(async (trx) => {
        await trx
          .updateTable("users")
          .set({
            email_verified: true,
            status: "ACTIVE",
            verification_code: null,
            verification_expires_at: null,
            last_login_at: new Date(),
          })
          .where("id", "=", user.id)
          .execute();

        await trx
          .insertInto("user_sessions")
          .values({
            id: randomUUID(),
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt,
          })
          .execute();
      });

      const ctx = context as any;
      if (ctx?.res) {
        const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
        const secureFlag = process.env.NODE_ENV === "production";
        ctx.res.cookie(cookieName, token, {
          httpOnly: true,
          secure: secureFlag,
          sameSite: "lax",
          expires: expiresAt,
        });
      }

      const userProfile = await database
        .selectFrom("user_profiles")
        .select("id")
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      return {
        message: "Email successfully verified. You are now logged in.",
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile_id: userProfile?.id || null,
          organization_id: user.organization_id || null,
        },
      };
    }),

  forgotPassword: publicProcedure
    .route({
      method: "POST",
      summary: "Request password reset",
      description: "Generates a reset token for a user forgot-password request",
      path: "/auth/forgot-password",
      tags: ["Auth"],
    })
    .input(ForgotPasswordInputSchema)
    .output(ForgotPasswordOutputSchema)
    .handler(async ({ input }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .where("email", "=", emailLower)
        .select(["id", "last_reset_sent_at"])
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", {
          message: "No account found with this email address",
        });
      }

      const now = new Date();
      if (
        user.last_reset_sent_at &&
        now.getTime() - parseDbDate(user.last_reset_sent_at).getTime() < 30000
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Please wait before requesting another reset link",
        });
      }

      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await database
        .updateTable("users")
        .set({
          reset_token: resetToken,
          reset_expires_at: resetExpiresAt,
          last_reset_sent_at: now,
        })
        .where("id", "=", user.id)
        .execute();

      sendResetEmail(emailLower, resetToken).catch((err) => {
        console.error(
          `[ForgotPassword] Failed to send reset email asynchronously: ${err?.message || String(err)}`,
        );
      });

      return {
        message: "Password reset code sent successfully.",
        reset_token: resetToken,
      };
    }),

  resetPassword: publicProcedure
    .route({
      method: "POST",
      summary: "Reset password with token",
      description:
        "Updates user password if the reset token matches and is valid",
      path: "/auth/reset-password",
      tags: ["Auth"],
    })
    .input(ResetPasswordInputSchema)
    .output(ResetPasswordOutputSchema)
    .handler(async ({ input }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", emailLower)
        .executeTakeFirst();

      if (!user) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      if (user.reset_token !== input.token) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Incorrect reset token",
        });
      }

      if (
        user.reset_expires_at &&
        parseDbDate(user.reset_expires_at).getTime() < Date.now()
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Reset token has expired",
        });
      }

      const passwordHash = hashPassword(input.password);

      await database
        .updateTable("users")
        .set({
          password_hash: passwordHash,
          reset_token: null,
          reset_expires_at: null,
          password_changed_at: new Date(),
        })
        .where("id", "=", user.id)
        .execute();

      return {
        message: "Password successfully updated.",
      };
    }),

  resendVerification: publicProcedure
    .route({
      method: "POST",
      summary: "Resend email verification",
      description: "Resends the email verification code for an unverified user",
      path: "/auth/resend-verification",
      tags: ["Auth"],
    })
    .input(ResendVerificationInputSchema)
    .output(ResendVerificationOutputSchema)
    .handler(async ({ input }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", emailLower)
        .executeTakeFirst();

      if (!user || user.email_verified) {
        return {
          message:
            "A new verification code has been sent if the account exists.",
        };
      }

      const now = new Date();
      if (
        user.verification_expires_at &&
        parseDbDate(user.verification_expires_at).getTime() < now.getTime()
      ) {
        await database.deleteFrom("users").where("id", "=", user.id).execute();
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Verification expired. Your account has been deleted. Please create a new account.",
        });
      }

      if (
        user.last_verification_sent_at &&
        now.getTime() - parseDbDate(user.last_verification_sent_at).getTime() <
          30000
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Please wait before requesting another code",
        });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await database
        .updateTable("users")
        .set({
          verification_code: code,
          verification_expires_at: expires,
          last_verification_sent_at: now,
        })
        .where("id", "=", user.id)
        .execute();

      sendVerificationEmail(user.email, code).catch((err) => {
        console.error(
          `[ResendVerification] Failed to send verification email asynchronously: ${err?.message || String(err)}`,
        );
      });

      return {
        message: "Verification code resent successfully.",
        verification_code: code,
      };
    }),

  logout: publicProcedure
    .route({
      method: "POST",
      summary: "User logout",
      description: "Revokes a user session token",
      path: "/auth/logout",
      tags: ["Auth"],
    })
    .input(LogoutInputSchema)
    .output(LogoutOutputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
      const token =
        input.token || (ctx?.req?.cookies ? ctx.req.cookies[cookieName] : null);

      if (token) {
        const tokenHash = createHash("sha256").update(token).digest("hex");

        await database
          .updateTable("user_sessions")
          .set({ revoked_at: new Date() })
          .where("token_hash", "=", tokenHash)
          .execute();
      }

      if (ctx?.res) {
        ctx.res.clearCookie(cookieName);
      }

      return {
        message: "Successfully logged out",
      };
    }),

  cancelUnverified: publicProcedure
    .route({
      method: "POST",
      summary: "Cancel unverified account registration",
      description: "Deletes an unverified user account",
      path: "/auth/cancel-unverified",
      tags: ["Auth"],
    })
    .input(CancelUnverifiedInputSchema)
    .output(CancelUnverifiedOutputSchema)
    .handler(async ({ input }) => {
      const emailLower = input.email.trim().toLowerCase();

      const user = await database
        .selectFrom("users")
        .selectAll()
        .where("email", "=", emailLower)
        .executeTakeFirst();

      if (!user) {
        return {
          message: "Account deleted or does not exist",
        };
      }

      if (user.email_verified) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "This account is already verified and cannot be deleted here.",
        });
      }

      const orgId = user.organization_id;

      await database.deleteFrom("users").where("id", "=", user.id).execute();

      if (user.role === "ORGANIZATION" && orgId) {
        await database
          .deleteFrom("organizations")
          .where("id", "=", orgId)
          .execute();
      }

      return {
        message: "Account registration successfully cancelled and deleted",
      };
    }),

  google: publicProcedure
    .route({
      method: "GET",
      summary: "Start Google OAuth flow",
      path: "/auth/google",
      tags: ["Auth"],
    })
    .handler(async ({ context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }

      await new Promise<void>((resolve, reject) => {
        passport.authenticate("google", {
          scope: ["profile", "email"],
        })(ctx.req, ctx.res, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }),

  googleCallback: publicProcedure
    .route({
      method: "GET",
      summary: "Handle Google OAuth callback",
      path: "/auth/google/callback",
      tags: ["Auth"],
    })
    .handler(async ({ context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }

      let user: any;
      try {
        user = await new Promise<any>((resolve, reject) => {
          passport.authenticate(
            "google",
            { session: false },
            (err: any, user: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            },
          )(ctx.req, ctx.res, (err: any) => {
            if (err) reject(err);
          });
        });
      } catch (err: any) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: `Google authentication failed: ${err?.message || String(err)}`,
        });
      }

      if (!user) {
        ctx.res.redirect(getLoginUrl("login"));
        return;
      }

      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await database
        .insertInto("user_sessions")
        .values({
          id: randomUUID(),
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          ip_address: ctx.req.ip || null,
          user_agent: ctx.req.get("user-agent") || null,
        })
        .execute();

      const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
      const secureFlag = process.env.NODE_ENV === "production";
      ctx.res.cookie(cookieName, token, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: "lax",
        expires: expiresAt,
      });

      const frontendUrl = FRONTEND_URL;
      ctx.res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google login completed</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  { type: "GOOGLE_LOGIN_SUCCESS" },
                  "${frontendUrl}"
                );
              }
              window.close();
            </script>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }),

  me: publicProcedure
    .route({
      method: "GET",
      summary: "Get current authenticated user",
      description: "Gets the user details for the active session cookie",
      path: "/auth/me",
      tags: ["Auth"],
    })
    .output(
      z
        .object({
          id: z.string(),
          email: z.string(),
          role: z.string(),
          profile_id: z.string().nullable(),
          organization_id: z.string().nullable(),
        })
        .nullable(),
    )
    .handler(async ({ context }) => {
      const ctx = context as any;
      const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
      const token = ctx?.req?.cookies ? ctx.req.cookies[cookieName] : null;

      if (!token) return null;

      const tokenHash = createHash("sha256").update(token).digest("hex");

      const session = await database
        .selectFrom("user_sessions")
        .select(["user_id", "expires_at", "revoked_at"])
        .where("token_hash", "=", tokenHash)
        .executeTakeFirst();

      if (!session) return null;

      if (
        session.revoked_at ||
        parseDbDate(session.expires_at).getTime() < Date.now()
      ) {
        return null;
      }

      const user = await database
        .selectFrom("users")
        .select(["id", "email", "role", "organization_id"])
        .where("id", "=", session.user_id)
        .executeTakeFirst();

      if (!user) return null;

      const userProfile = await database
        .selectFrom("user_profiles")
        .select("id")
        .where("user_id", "=", user.id)
        .executeTakeFirst();

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_id: userProfile?.id || null,
        organization_id: user.organization_id || null,
      };
    }),

  linkedin: publicProcedure
    .route({
      method: "GET",
      summary: "Start LinkedIn OAuth flow",
      path: "/auth/linkedin",
      tags: ["Auth"],
    })
    .handler(async ({ context }) => {
      try {
        const ctx = context as any;
        if (!ctx?.req || !ctx?.res) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Express request/response context missing",
          });
        }

        await new Promise<void>((resolve, reject) => {
          passport.authenticate("linkedin", {
            scope: ["openid", "profile", "email"],
          })(ctx.req, ctx.res, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.log(error);
      }
    }),

  linkedinCallback: publicProcedure
    .route({
      method: "GET",
      summary: "Handle LinkedIn OAuth callback",
      path: "/auth/linkedin/callback",
      tags: ["Auth"],
    })
    .handler(async ({ context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }

      const frontendUrl = FRONTEND_URL;

      let user: any;
      try {
        user = await new Promise<any>((resolve, reject) => {
          passport.authenticate(
            "linkedin",
            { session: false },
            (err: any, user: any, info: any) => {
              if (err) {
                console.error("[LinkedIn Callback] Error:", err);
                reject(err);
              } else if (!user) {
                console.error("[LinkedIn Callback] Authentication failed. Info:", info);
                reject(new Error(info?.message || "LinkedIn authentication failed (user not found)."));
              } else {
                resolve(user);
              }
            },
          )(ctx.req, ctx.res, (err: any) => {
            if (err) {
              console.error("[LinkedIn Callback] Authenticate threw error:", err);
              reject(err);
            }
          });
        });
      } catch (err: any) {
        console.error("[LinkedIn Callback] Caught error in callback handler:", err);
        ctx.res.send(`
          <!DOCTYPE html>
          <html>
            <head><title>LinkedIn login failed</title></head>
            <body>
              <script>
                if (window.opener) {
                  window.opener.postMessage(
                    { type: "LINKEDIN_LOGIN_ERROR", error: ${JSON.stringify(err?.message || String(err))} },
                    "${frontendUrl}"
                  );
                }
                window.close();
              </script>
              <p>Authentication failed: ${err?.message || String(err)}</p>
            </body>
          </html>
        `);
        return;
      }

      // Create session
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await database
        .insertInto("user_sessions")
        .values({
          id: randomUUID(),
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
          ip_address: ctx.req.ip || null,
          user_agent: ctx.req.get("user-agent") || null,
        })
        .execute();

      const cookieName = process.env.SESSION_COOKIE_NAME || "bildyx_session";
      const secureFlag = process.env.NODE_ENV === "production";
      ctx.res.cookie(cookieName, token, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: "lax",
        expires: expiresAt,
      });

      ctx.res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>LinkedIn login completed</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  { type: "LINKEDIN_LOGIN_SUCCESS" },
                  "${frontendUrl}"
                );
              }
              window.close();
            </script>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }),
};
