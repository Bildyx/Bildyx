process.env.NODE_ENV = "test";
import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { user_education_fields } from "../routes/user_education_fields";
import { database, pgliteClient } from "../database";
import { ORPCError } from "@orpc/server";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("UserEducationFields API Endpoints", { concurrency: 1 }, () => {
  let testUserId: string;
  let testProfileId: string;
  let testEducationId: string;
  let testStudyFieldId1: string;
  let testStudyFieldId2: string;
  let createdFieldId1: string;
  let createdFieldId2: string;

  before(async () => {
    if (process.env.NODE_ENV === "test" && pgliteClient) {
      const schemaPath = path.join(__dirname, "schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pgliteClient.exec(schemaSql);

      // Ensure EducationFieldType enum exists
      // Note: pgliteClient.exec() is intercepted after schema load to prevent duplicate loads.
      // We use Kysely's sql.raw() to execute DDL statements directly.
      try {
        await database.executeQuery(
          sql`CREATE TYPE "EducationFieldType" AS ENUM ('MAJOR', 'MINOR')`.compile(
            database,
          ),
        );
      } catch {
        // ignore if already exists
      }

      // Ensure study_fields table exists
      await database.executeQuery(
        sql`CREATE TABLE IF NOT EXISTS "StudyFields" (
          "id" UUID NOT NULL,
          "name" TEXT NOT NULL,
          "serial_number" TEXT NOT NULL,
          "area" TEXT,
          "description" TEXT,
          "score" INTEGER,
          "metadata" JSONB,
          "deleted_at" TIMESTAMP(3),
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "StudyFields_pkey" PRIMARY KEY ("id")
        )`.compile(database),
      );

      // Ensure user_education_fields table exists
      await database.executeQuery(
        sql`CREATE TABLE IF NOT EXISTS "user_education_fields" (
          "id" UUID NOT NULL,
          "user_education_id" UUID NOT NULL,
          "study_field_Id" UUID NOT NULL,
          "type" "EducationFieldType" NOT NULL,
          CONSTRAINT "user_education_fields_pkey" PRIMARY KEY ("id")
        )`.compile(database),
      );
    }

    testUserId = randomUUID();
    await database
      .insertInto("users")
      .values({
        id: testUserId,
        email: `edu-fields-test-${testUserId}@bildyx.com`,
        password_hash: "hash",
        updated_at: new Date(),
      })
      .execute();

    testProfileId = randomUUID();
    await database
      .insertInto("user_profiles")
      .values({
        id: testProfileId,
        user_id: testUserId,
        updated_at: new Date(),
      })
      .execute();

    testEducationId = randomUUID();
    await database
      .insertInto("user_educations")
      .values({ id: testEducationId, user_profile_id: testProfileId })
      .execute();

    testStudyFieldId1 = randomUUID();
    testStudyFieldId2 = randomUUID();
    await database
      .insertInto("StudyFields")
      .values([
        {
          id: testStudyFieldId1,
          name: "Computer Science",
          serial_number: `cs-${testStudyFieldId1}`,
          updated_at: new Date(),
        },
        {
          id: testStudyFieldId2,
          name: "Mathematics",
          serial_number: `math-${testStudyFieldId2}`,
          updated_at: new Date(),
        },
      ])
      .execute();
  });

  after(async () => {
    try {
      const ids = [createdFieldId1, createdFieldId2].filter(Boolean);
      if (ids.length > 0) {
        await database
          .deleteFrom("user_education_fields")
          .where("id", "in", ids)
          .execute();
      }
      await database
        .deleteFrom("user_educations")
        .where("id", "=", testEducationId)
        .execute();
      await database
        .deleteFrom("StudyFields")
        .where("id", "in", [testStudyFieldId1, testStudyFieldId2])
        .execute();
      await database
        .deleteFrom("user_profiles")
        .where("id", "=", testProfileId)
        .execute();
      await database.deleteFrom("users").where("id", "=", testUserId).execute();
    } catch (err) {
      console.error("Cleanup error in test teardown:", err);
    } finally {
      await database.destroy();
      if (pgliteClient) {
        await pgliteClient.close();
      }
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure["~orpc"]?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure["~orpc"]?.handler;
    return await handler({ input: validatedInput });
  };

  describe("POST /education-fields (Create)", () => {
    test("should throw ZodError when required fields are missing", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.create, {
          user_education_id: testEducationId,
        }),
        (err: any) => err.name === "ZodError",
      );
    });

    test("should throw NOT_FOUND when education does not exist", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.create, {
          user_education_id: randomUUID(),
          study_field_Id: testStudyFieldId1,
          type: "MAJOR",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully create a user education field", async () => {
      const res = await callProcedure(user_education_fields.create, {
        user_education_id: testEducationId,
        study_field_Id: testStudyFieldId1,
        type: "MAJOR",
      });

      assert.ok(res.id);
      assert.strictEqual(res.user_education_id, testEducationId);
      assert.strictEqual(res.study_field_Id, testStudyFieldId1);
      assert.strictEqual(res.type, "MAJOR");
      createdFieldId1 = res.id;
    });

    test("should successfully create a second education field", async () => {
      const res = await callProcedure(user_education_fields.create, {
        user_education_id: testEducationId,
        study_field_Id: testStudyFieldId2,
        type: "MINOR",
      });

      assert.ok(res.id);
      createdFieldId2 = res.id;
    });

    test("should throw CONFLICT when field is already linked", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.create, {
          user_education_id: testEducationId,
          study_field_Id: testStudyFieldId1,
          type: "MAJOR",
        }),
        (err: any) => err instanceof ORPCError && err.code === "CONFLICT",
      );
    });
  });

  describe("GET /educations/{userEducationId}/fields (GetByEducation)", () => {
    test("should throw NOT_FOUND when education does not exist", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.getByEducation, {
          userEducationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return fields of the education", async () => {
      const res = await callProcedure(user_education_fields.getByEducation, {
        userEducationId: testEducationId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((f: any) => f.id);
      assert.ok(ids.includes(createdFieldId1));
      assert.ok(ids.includes(createdFieldId2));
    });
  });

  describe("GET /education-fields/{fieldId} (GetById)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.getById, { fieldId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully return the field by its ID", async () => {
      const res = await callProcedure(user_education_fields.getById, {
        fieldId: createdFieldId1,
      });
      assert.strictEqual(res.id, createdFieldId1);
      assert.strictEqual(res.type, "MAJOR");
    });
  });

  describe("PATCH /education-fields/{fieldId} (Update)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.update, {
          fieldId: randomUUID(),
          type: "MINOR",
        }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully update a field type", async () => {
      const res = await callProcedure(user_education_fields.update, {
        fieldId: createdFieldId1,
        type: "MINOR",
      });

      assert.strictEqual(res.id, createdFieldId1);
      assert.strictEqual(res.type, "MINOR");
    });
  });

  describe("DELETE /education-fields/{fieldId} (Delete)", () => {
    test("should throw NOT_FOUND for a non-existent ID", async () => {
      await assert.rejects(
        callProcedure(user_education_fields.delete, { fieldId: randomUUID() }),
        (err: any) => err instanceof ORPCError && err.code === "NOT_FOUND",
      );
    });

    test("should successfully delete a field by ID", async () => {
      const res = await callProcedure(user_education_fields.delete, {
        fieldId: createdFieldId1,
      });
      assert.strictEqual(res.id, createdFieldId1);
      createdFieldId1 = "";
    });
  });

  describe("DELETE /education-fields (DeleteBulk)", () => {
    test("should successfully bulk delete fields by IDs", async () => {
      const res = await callProcedure(user_education_fields.deleteBulk, {
        fieldIds: [createdFieldId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdFieldId2);
      createdFieldId2 = "";
    });
  });
});
