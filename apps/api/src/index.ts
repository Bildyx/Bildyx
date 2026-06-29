const beforeTimeMs = performance.now();
import express from "express";
import util from "node:util";
import prettyMilliseconds from "pretty-ms";
import { openAPIGenerator, openAPIHandler, rpcHandler } from "./application";
import {
  NAME,
  OPENAPI_PREFIX,
  VERSION,
  HOST,
  PORT,
  RPC_PREFIX,
} from "./configuration";
import { router } from "./routes/router";
import { database } from "./database";

const app = express();

app.use(express.json());

app.use(async (req, res, next) => {
  const result = await rpcHandler.handle(req, res, {
    context: { headers: req.headers },
    prefix: RPC_PREFIX,
  });
  if (result.matched) {
    return;
  }
  next();
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

app.use(async (req, res, next) => {
  const result = await openAPIHandler.handle(req, res, {
    context: { headers: req.headers },
    prefix: OPENAPI_PREFIX,
  });
  if (result.matched) {
    return;
  }
  next();
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
            operationsSorter: (a, b) => {
              const methods = ['get', 'post', 'put', 'patch', 'delete'];
              const diff = methods.indexOf(a.method.toLowerCase()) - methods.indexOf(b.method.toLowerCase());
              if (diff !== 0) return diff;
              return a.path.localeCompare(b.path);
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
