import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load environment variables from workspace root or current directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // prisma/seed.ts (données de référence) n'était rattaché à aucun script
    // npm ni à cette configuration : seul `npm run seed` existait, et il
    // pointe sur src/seed.ts, qui ne crée que des lignes de test.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
