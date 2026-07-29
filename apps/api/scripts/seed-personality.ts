import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import {
  loadPersonalityContent,
  seedPersonalityTests,
} from "../prisma/seeds/seeds_personality";

// `--check` valide les JSON sans toucher a la base : utilisable hors ligne
// et en CI, la ou le seed complet demande une connexion Postgres.
const checkOnly = process.argv.includes("--check");

async function main() {
  if (checkOnly) {
    const tests = loadPersonalityContent();
    for (const t of tests) {
      console.log(
        `  ${t.code}: ${t.criteria.length} critere(s), ${t.questions.length} question(s), ${
          t.questions.filter((q) => q.reverse_scored).length
        } inversee(s)`,
      );
    }
    console.log(`OK - ${tests.length} test(s) valide(s).`);
    return;
  }

  const prisma = new PrismaClient();
  try {
    await seedPersonalityTests(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seed personality failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
