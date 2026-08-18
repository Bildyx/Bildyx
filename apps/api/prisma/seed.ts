import "dotenv/config";

import { PrismaClient } from "@prisma/client";

import { seedIndustries } from "./seeds/seeds_industries";
import { seedCountries } from "./seeds/seeds_countries";
import { seedCities } from "./seeds/seeds_cities";
import { seedOrganizations } from "./seeds/seeds_organizations";
import { seedJobs } from "./seeds/seeds_jobs";
import { seedSkills } from "./seeds/seeds_skills";
import { seedCertifications } from "./seeds/seeds_certifications";
import { seedDegrees } from "./seeds/seeds_degrees";
import { seedSubjects } from "./seeds/seeds_subjects";
import { seedManyToManyRelations } from "./seeds/seeds_relations";
import { seedPersonalityTests } from "./seeds/seeds_personality";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // Order matters because of the foreign keys:
  // industries -> countries -> cities -> organizations
  //   -> jobs / certifications / subjects (depend on the previous ones)
  // skills / degrees / studyFields have no dependencies and could go
  // anywhere, but are kept at the end here for simplicity.

  await seedIndustries(prisma);
  await seedCountries(prisma);
  await seedCities(prisma);
  await seedOrganizations(prisma);
  await seedJobs(prisma);
  await seedCertifications(prisma);
  await seedSubjects(prisma);
  await seedSkills(prisma);
  await seedDegrees(prisma);

  // Personality questionnaire content (tests, criteria, questions). No
  // dependency on the other reference models, the source is
  // prisma/seeds/personality/*.json rather than a CSV.
  await seedPersonalityTests(prisma);

  // Must run last: links the implicit many-to-many relations
  // (Organization<->Country/Industry/City, City<->Industry, Subject<->
  // Industry, Industry<->Industry) once every row they reference exists in
  // the database.
  await seedManyToManyRelations(prisma);

  console.log("\nSeed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
