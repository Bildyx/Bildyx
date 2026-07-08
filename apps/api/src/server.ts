const beforeTimeMs = performance.now()
import express from "express"
import util from "node:util"
import prettyMilliseconds from "pretty-ms"
import { openAPIGenerator, openAPIHandler, rpcHandler } from "./application"
import { NAME, OPENAPI_PREFIX, VERSION, HOST, PORT, RPC_PREFIX } from "./configuration"
import { router } from "./routes/router"
import { database } from "./database"

const app = express()

app.use(express.json())

app.use(async (req, res, next) => {
  const result = await rpcHandler.handle(req, res, {
    context: { headers: req.headers },
    prefix: RPC_PREFIX,
  })
  if (result.matched) {
    return
  }
  next()
})

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
  })

  res.json(spec)
})

app.use(async (req, res, next) => {
  const result = await openAPIHandler.handle(req, res, {
    context: { headers: req.headers },
    prefix: OPENAPI_PREFIX,
  })
  if (result.matched) {
    return
  }
  next()
})

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
  `

  res.status(200).type("html").send(html)
})

const server = app.listen(PORT, HOST, () => {
  const afterTimeMs = performance.now()
  const elapsedTimeMs = afterTimeMs - beforeTimeMs

  const address = JSON.stringify(server.address())
  console.log(
    `API ${util.styleText("bold", `v${VERSION}`)} listening at ${util.styleText("cyan", address)}`,
  )
  console.log(`Ready in ${prettyMilliseconds(elapsedTimeMs)}`)
  console.log()
})

const gracefulShutdown = async (): Promise<void> => {
  await database.destroy()
  server.close((error) => {
    if (error != null) {
      console.error("Error during server shutdown:", error)
      return process.exit(1)
    }
    process.exit(0)
  })
}
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)