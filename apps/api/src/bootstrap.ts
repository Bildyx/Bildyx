/**
 * API bootstrap
 *
 * Loads the root environment file before importing the application.
 * The dynamic import is important because normal ESM imports are
 * evaluated before the body of the current module.
 */

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const rootEnvPath = path.resolve(
  currentDirectory,
  "../../../.env",
);

const result = dotenv.config({
  path: rootEnvPath,
});

if (result.error) {
  throw new Error(
    `Unable to load the root environment file at ${rootEnvPath}: ${result.error.message}`,
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing from the root .env file.",
  );
}

console.log(`Environment loaded from ${rootEnvPath}`);

// Import the application only after environment variables are loaded.
await import("./index");