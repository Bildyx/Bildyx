import { database } from "./database";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Database seeding started...");

  // 1. Clean up existing test data to allow re-running
  await database.deleteFrom("certifications")
    .where("name", "like", "Test %")
    .execute();

  await database.deleteFrom("organizations")
    .where("name", "like", "Test %")
    .execute();

  // 2. Create sample Organization
  const orgId = randomUUID();
  await database.insertInto("organizations")
    .values({
      id: orgId,
      name: "Test Organization Inc.",
      slug: "test-organization-inc",
      updated_at: new Date(),
    })
    .execute();
  console.log(`✅ Created Organization: Test Organization Inc. (${orgId})`);

  // 3. Create sample Certifications linked to the Organization
  const certId1 = randomUUID();
  await database.insertInto("certifications")
    .values({
      id: certId1,
      name: "Test AWS Cloud Certification",
      serial_number: "AWS-TEST-12345",
      issuing_organization_id: orgId,
      description: "A test certification for AWS cloud architecture.",
      level: "INTERMEDIATE",
      category: "TECHNICAL",
      validity_duration_months: 24,
      website_url: "https://aws.amazon.com",
      updated_at: new Date(),
    })
    .execute();
  console.log(`✅ Created Certification 1: Test AWS Cloud Certification (${certId1})`);

  const certId2 = randomUUID();
  await database.insertInto("certifications")
    .values({
      id: certId2,
      name: "Test Project Management Professional",
      serial_number: "PMP-TEST-67890",
      issuing_organization_id: orgId,
      description: "A test certification for PM methodologies.",
      level: "ADVANCED",
      category: "PROJECTMANAGEMENT",
      validity_duration_months: 36,
      website_url: "https://pmi.org",
      updated_at: new Date(),
    })
    .execute();
  console.log(`✅ Created Certification 2: Test Project Management Professional (${certId2})`);

  console.log("🏁 Database seeding completed successfully!");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await database.destroy();
  });
