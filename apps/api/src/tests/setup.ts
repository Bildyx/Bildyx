// src/tests/setup.ts
process.env.NODE_ENV = "test";

import { after } from "node:test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { database, pgliteClient } from "../database";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Generate/verify schema.sql cache before running tests
const rootDir = path.resolve(__dirname, "../..");
const schemaPath = path.join(rootDir, "prisma/schema.prisma");
const outPath = path.join(__dirname, "schema.sql");
const hashPath = path.join(__dirname, ".schema.hash");

if (fs.existsSync(schemaPath)) {
  const currentHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(schemaPath))
    .digest("hex");

  const previousHash = fs.existsSync(hashPath)
    ? fs.readFileSync(hashPath, "utf8")
    : null;

  if (currentHash !== previousHash) {
    console.log("Generating schema.sql from schema.prisma...");
    try {
      const sql = execSync(
        "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
        { cwd: rootDir, encoding: "utf-8", env: { ...process.env, CHECKPOINT_DISABLE: "1" } },
      );
      fs.writeFileSync(outPath, sql);
      fs.writeFileSync(hashPath, currentHash);
      console.log("schema.sql successfully generated.");
    } catch (err) {
      console.error("Failed to generate schema.sql from Prisma schema:", err);
      process.exit(1);
    }
  }
}

// 2. Load schema.sql into PGLite
if (pgliteClient) {
  const schemaSql = fs.readFileSync(outPath, "utf8");
  await pgliteClient.exec(schemaSql);
}

// 3. Global cleanup after tests
after(async () => {
  if (pgliteClient) {
    try {
      await pgliteClient.close();
    } catch (e) {
      // Ignore
    }
  }
  try {
    if ((database as any).realDestroy) {
      await (database as any).realDestroy();
    } else {
      await database.destroy();
    }
  } catch (e) {
    // Ignore
  }
});
