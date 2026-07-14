// scripts/generate-test-schema.ts
import { execSync } from "child_process";
import fs from "fs";
import crypto from "crypto";

const schemaPath = "prisma/schema.prisma";
const outPath = "src/tests/schema.sql";
const hashPath = "src/tests/.schema.hash";

const currentHash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(schemaPath))
  .digest("hex");

const previousHash = fs.existsSync(hashPath)
  ? fs.readFileSync(hashPath, "utf8")
  : null;

if (currentHash !== previousHash) {
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8", env: { ...process.env, CHECKPOINT_DISABLE: "1" } },
  );
  fs.writeFileSync(outPath, sql);
  fs.writeFileSync(hashPath, currentHash);
  console.log("schema.sql régénéré");
} else {
  console.log("schema.sql inchangé, skip");
}
