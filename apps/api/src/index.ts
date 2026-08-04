const beforeTimeMs = performance.now();
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
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
} from "./configuration";
import { router } from "./routes/router";
import { database } from "./database";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { randomUUID, randomBytes } from "node:crypto";
import { hashPassword } from "./services/auth.service";
import cors from "cors";
import { LanguageSchema } from "./models/utils/enums";

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:8000",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://localhost:8080",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8080",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

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
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error("Google account has no email"));
          }

          const existingUser = await database
            .selectFrom("users")
            .select(["id", "email", "role", "email_verified"])
            .where("email", "=", email)
            .where("deleted_at", "is", null)
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
                  updated_at: new Date(),
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
                first_name: profile.name?.givenName || "",
                last_name: profile.name?.familyName || "",
                display_name: profile.displayName || "",
                avatar_url: profile.photos?.[0]?.value || null,
                role: "CANDIDATE",
                marketing_opt_in: false,
                email_verified: true,
                password_hash: randomPasswordHash,
                verification_code: null,
                verification_expires_at: null,
                last_verification_sent_at: null,
                status: "ACTIVE",
                updated_at: new Date(),
              })
              .execute();

            await trx
              .insertInto("user_profiles")
              .values({
                id: randomUUID(),
                user_id: userId,
                is_public: true,
                updated_at: new Date(),
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
app.use("/css", express.static(path.resolve(__dirname, "templates/organizations")));


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

  const url = `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`;
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
