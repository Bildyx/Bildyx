import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pgliteClient } from "../database";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setup() {
  if (process.env.NODE_ENV === "test" && pgliteClient) {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await pgliteClient.exec(schemaSql);
  }
}
