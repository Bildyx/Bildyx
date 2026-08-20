const beforeTimeMs = performance.now();
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import util from "node:util";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import prettyMilliseconds from "pretty-ms";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { openAPIGenerator, openAPIHandler, rpcHandler } from "./application";
import {
  NAME,
  OPENAPI_PREFIX,
  VERSION,
  HOST,
  PORT,
  RPC_PREFIX,
  API_URL,
  FRONTEND_URL,
} from "./configuration";
import { router } from "./routes/router";
import { database } from "./database";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import { randomUUID, randomBytes } from "node:crypto";
import { hashPassword } from "./services/auth.service";
import cors from "cors";
import { LanguageSchema } from "./models/utils/enums";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === FRONTEND_URL) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${API_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google account has no email"));
          }

          const existingUser = await database
            .selectFrom("users")
            .select(["id", "email", "role", "email_verified"])
            .where("email", "=", email)
            .executeTakeFirst();

          if (existingUser) {
            if (!existingUser.email_verified) {
              await database
                .updateTable("users")
                .set({
                  email_verified: true,
                  verification_code: null,
                  verification_expires_at: null,
                  last_verification_sent_at: null,
                  status: "ACTIVE",
                })
                .where("id", "=", existingUser.id)
                .execute();

              const verifiedUser = {
                ...existingUser,
                email_verified: true,
              };
              return done(null, verifiedUser);
            }

            return done(null, existingUser);
          }

          const randomPasswordHash = hashPassword(
            randomBytes(32).toString("hex"),
          );
          const userId = randomUUID();

          await database.transaction().execute(async (trx) => {
            await trx
              .insertInto("users")
              .values({
                id: userId,
                email,
                role: "CANDIDATE",
                marketing_opt_in: false,
                email_verified: true,
                password_hash: randomPasswordHash,
                verification_code: null,
                verification_expires_at: null,
                last_verification_sent_at: null,
                status: "ACTIVE",
              })
              .execute();

            const firstName = profile.name?.givenName || null;
            const lastName = profile.name?.familyName || null;
            const avatarUrl = profile.photos?.[0]?.value || null;

            await trx
              .insertInto("user_profiles")
              .values({
                id: randomUUID(),
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
                is_public: true,
              })
              .execute();
          });

          const newUser = {
            id: userId,
            email,
            role: "CANDIDATE",
            email_verified: true,
          };

          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
} else {
  console.warn(
    "Google OAuth credentials missing. Google login strategy not loaded.",
  );
}

if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    "linkedin",
    new OpenIDConnectStrategy(
      {
        issuer: "https://www.linkedin.com/oauth",
        authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
        tokenURL: "https://www.linkedin.com/oauth/v2/accessToken",
        userInfoURL: "https://api.linkedin.com/v2/userinfo",
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${API_URL}/api/auth/linkedin/callback`,
        scope: ["openid", "profile", "email"],
      },
      async (
        issuer: string,
        profile: any,
        context: any,
        idToken: any,
        accessToken: any,
        refreshToken: any,
        done: any,
      ) => {
        try {
          const callback =
            typeof done === "function"
              ? done
              : typeof accessToken === "function"
                ? accessToken
                : context;
          const token =
            typeof accessToken === "string"
              ? accessToken
              : typeof idToken === "string"
                ? idToken
                : null;

          let rawData: any = {};
          if (token) {
            const res = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${token}` },
            });
            rawData = await res.json();
          }

          const email =
            rawData.email?.toLowerCase() ??
            profile.email?.toLowerCase() ??
            profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return callback(new Error("LinkedIn account has no email"));
          }

          const firstName =
            rawData.given_name ??
            profile.name?.givenName ??
            profile.givenName ??
            "Firstname";

          const lastName =
            rawData.family_name ??
            profile.name?.familyName ??
            profile.familyName ??
            "Lastname";

          const avatarUrl = rawData.picture ?? profile.picture ?? null;

          const existingUser = await database
            .selectFrom("users")
            .select(["id", "email", "role", "email_verified"])
            .where("email", "=", email)
            .executeTakeFirst();

          if (existingUser) {
            if (!existingUser.email_verified) {
              await database
                .updateTable("users")
                .set({
                  email_verified: true,
                  verification_code: null,
                  verification_expires_at: null,
                  last_verification_sent_at: null,
                  status: "ACTIVE",
                })
                .where("id", "=", existingUser.id)
                .execute();

              return callback(null, {
                ...existingUser,
                email_verified: true,
              });
            }
            return callback(null, existingUser);
          }

          const randomPasswordHash = hashPassword(
            randomBytes(32).toString("hex"),
          );
          const userId = randomUUID();

          await database.transaction().execute(async (trx) => {
            await trx
              .insertInto("users")
              .values({
                id: userId,
                email,
                role: "CANDIDATE",
                marketing_opt_in: false,
                email_verified: true,
                password_hash: randomPasswordHash,
                verification_code: null,
                verification_expires_at: null,
                last_verification_sent_at: null,
                status: "ACTIVE",
              })
              .execute();

            await trx
              .insertInto("user_profiles")
              .values({
                id: randomUUID(),
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                avatar_url: avatarUrl,
                is_public: true,
              })
              .execute();
          });

          return callback(null, {
            id: userId,
            email,
            role: "CANDIDATE",
            email_verified: true,
          });
        } catch (err) {
          console.error("[LinkedIn] Database/auth error:", err);
          return typeof done === "function" ? done(err) : null;
        }
      },
    ),
  );
} else {
  console.warn(
    "LinkedIn OAuth credentials missing. LinkedIn login strategy not loaded.",
  );
}

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

app.use(async (req, res, next) => {
  try {
    const result = await rpcHandler.handle(req, res, {
      context: { headers: req.headers, req, res },
      prefix: RPC_PREFIX,
    });
    if (result.matched) {
      return;
    }
    next();
  } catch (err) {
    if (res.headersSent) {
      return;
    }
    next(err);
  }
});

app.get("/spec.json", async (req, res) => {
  const spec = await openAPIGenerator.generate(router, {
    info: {
      title: NAME,
      version: VERSION,
    },
    servers: [{ url: OPENAPI_PREFIX }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  });

  res.json(spec);
});

app.get("/enums/languages", (_req, res) => {
  res.json(LanguageSchema.options);
});

app.use(
  "/css",
  express.static(path.resolve(__dirname, "templates/organizations")),
);

const iconsDir = fs.existsSync(path.resolve(process.cwd(), "../../Files/icons"))
  ? path.resolve(process.cwd(), "../../Files/icons")
  : fs.existsSync(path.resolve(process.cwd(), "Files/icons"))
    ? path.resolve(process.cwd(), "Files/icons")
    : path.resolve(__dirname, "../../../../Files/icons");

app.use(
  "/static/icons",
  express.static(iconsDir, {
    maxAge: "7d",
    immutable: true,
  }),
);

app.use(async (req, res, next) => {
  try {
    const result = await openAPIHandler.handle(req, res, {
      context: { headers: req.headers, req, res },
      prefix: OPENAPI_PREFIX,
    });
    if (result.matched) {
      return;
    }
    next();
  } catch (err) {
    if (res.headersSent) {
      return;
    }
    next(err);
  }
});

app.use((req, res) => {
  const html = `
    <!doctype html>
    <html>
      <head>
        <title>${NAME}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="https://orpc.unnoq.com/icon.svg" />
      </head>
      <body>
        <div id="app"></div>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        <script>
          Scalar.createApiReference('#app', {
            url: '/spec.json',
            orderSchemaPropertiesBy: 'preserve',
            operationsSorter: (a, b) => {
              const methods = ['get', 'post', 'put', 'patch', 'delete'];
              const diff = methods.indexOf(a.method.toLowerCase()) - methods.indexOf(b.method.toLowerCase());
              if (diff !== 0) return diff;

              return a.idx - b.idx;
            },
            authentication: {
              securitySchemes: {
                bearerAuth: {
                  token: 'default-token',
                },
              },
            },
          })
        </script>
      </body>
    </html>
  `;

  res.status(200).type("html").send(html);
});

const server = app.listen(PORT, HOST, () => {
  const afterTimeMs = performance.now();
  const elapsedTimeMs = afterTimeMs - beforeTimeMs;

  const url = `http://${HOST}:${PORT}`;
  console.log(
    `API ${util.styleText("bold", `v${VERSION}`)} listening at ${util.styleText("cyan", url)}`,
  );
  console.log(`Ready in ${prettyMilliseconds(elapsedTimeMs)}`);
  console.log();
});

const gracefulShutdown = async (): Promise<void> => {
  await database.destroy();
  server.close((error) => {
    if (error != null) {
      console.error("Error during server shutdown:", error);
      return process.exit(1);
    }
    process.exit(0);
  });
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
