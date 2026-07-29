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
import { seedStudyFields } from "./seeds/seeds_studyFields";
import { seedManyToManyRelations } from "./seeds/seeds_relations";
import { seedPersonalityTests } from "./seeds/seeds_personality";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // Ordre important a cause des foreign keys :
  // industries -> countries -> cities -> organizations
  //   -> jobs / certifications / subjects (dependent des precedents)
  // skills / degrees / studyFields n'ont pas de dependances, peuvent etre
  // placés n'importe où, mais laissés en fin ici par simplicité.

  await seedIndustries(prisma);
  await seedCountries(prisma);
  await seedCities(prisma);
  await seedOrganizations(prisma);
  await seedJobs(prisma);
  await seedCertifications(prisma);
  await seedSubjects(prisma);
  await seedSkills(prisma);
  await seedDegrees(prisma);
  await seedStudyFields(prisma);

  // Contenu des questionnaires de personnalite (tests, criteres,
  // questions). Aucune dependance sur les autres modeles de reference,
  // la source est prisma/seeds/personality/*.json et non un CSV.
  await seedPersonalityTests(prisma);

  // Doit tourner en dernier : lie les relations many-to-many implicites
  // (Organization<->Country/Industry/City, City<->Industry, Subject<->
  // Industry, Industry<->Industry) une fois que toutes les lignes qu'elles
  // referencent existent en base.
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
