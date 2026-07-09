import { RPCHandler } from "@orpc/server/node"
import { OpenAPIHandler } from "@orpc/openapi/node"
import { CORSPlugin } from "@orpc/server/plugins"
import { router } from "./routes/router"
import { OpenAPIGenerator } from "@orpc/openapi"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"

const corsPlugin = new CORSPlugin({
  exposeHeaders: ["Content-Disposition"],
})

export const rpcHandler = new RPCHandler(router, {
  plugins: [corsPlugin],
})

export const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [corsPlugin],
})

// Custom schema converter to support raw JSON Schema objects
const customSchemaConverter = {
  condition: async (schema: any): Promise<boolean> => {
    return !!(schema && typeof schema === "object" && schema.type === "object");
  },
  convert: async (schema: any): Promise<[required: boolean, jsonSchema: any]> => {
    return [true, schema];
  }
}

export const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter(),
    customSchemaConverter,
  ],
})