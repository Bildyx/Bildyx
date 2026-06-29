import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { certifications } from '../routes/certifications';
import { database } from '../database';
import { ORPCError } from '@orpc/server';
import { randomUUID } from 'node:crypto';

describe('Certifications API Endpoints', () => {
  let testOrgId: string;
  let createdCertId1: string;
  let createdCertId2: string;

  before(async () => {
    // Setup temporary organization for testing
    testOrgId = randomUUID();

    await database.insertInto('organizations')
      .values({
        id: testOrgId,
        name: 'Test Org for Certifications',
        slug: 'test-org-for-certifications-' + testOrgId,
        updated_at: new Date()
      })
      .execute();
  });

  after(async () => {
    // Clean up test certifications and organization
    try {
      const certIds = [createdCertId1, createdCertId2].filter(Boolean);
      if (certIds.length > 0) {
        await database.deleteFrom('certifications')
          .where('id', 'in', certIds)
          .execute();
      }

      await database.deleteFrom('organizations')
        .where('id', '=', testOrgId)
        .execute();
    } catch (err) {
      console.error("Cleanup error in test teardown:", err);
    } finally {
      await database.destroy();
    }
  });

  const callProcedure = async (procedure: any, input?: any) => {
    const schema = procedure['~orpc']?.inputSchema;
    const validatedInput = schema && input ? schema.parse(input) : input;
    const handler = procedure['~orpc']?.handler;
    return await handler({ input: validatedInput });
  };

  describe('POST /certifications (Create)', () => {
    test('should throw ZodError when name is missing', async () => {
      await assert.rejects(
        callProcedure(certifications.create, {
          serialNumber: 'SN-CREATE-FAIL',
        }),
        (err: any) => err.name === 'ZodError'
      );
    });

    test('should throw ZodError when serialNumber is missing', async () => {
      await assert.rejects(
        callProcedure(certifications.create, {
          name: 'Some Cert',
        }),
        (err: any) => err.name === 'ZodError'
      );
    });

    test('should successfully create a certification', async () => {
      const res = await callProcedure(certifications.create, {
        name: 'Integration Test AWS Certification',
        serialNumber: 'AWS-INTEG-111',
        issuing_organization_id: testOrgId,
        description: 'Test description',
        level: 'INTERMEDIATE',
        category: 'TECHNICAL',
        validity_duration_months: 12,
      });

      assert.ok(res.id);
      assert.strictEqual(res.name, 'Integration Test AWS Certification');
      assert.strictEqual(res.serialNumber, 'AWS-INTEG-111');
      assert.strictEqual(res.issuing_organization_id, testOrgId);
      createdCertId1 = res.id;
    });

    test('should successfully create a second certification', async () => {
      const res = await callProcedure(certifications.create, {
        name: 'Integration Test Scrum Master',
        serialNumber: 'SCRUM-INTEG-222',
        issuing_organization_id: testOrgId,
        category: 'PROJECTMANAGEMENT',
      });

      assert.ok(res.id);
      createdCertId2 = res.id;
    });
  });

  describe('GET /organizations/{organizationId}/certifications (GetByCompany)', () => {
    test('should throw NOT_FOUND when organization does not exist', async () => {
      await assert.rejects(
        callProcedure(certifications.getByCompany, {
          organizationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should successfully return the certifications of the organization', async () => {
      const res = await callProcedure(certifications.getByCompany, {
        organizationId: testOrgId,
      });

      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
      const ids = res.map((c: any) => c.id);
      assert.ok(ids.includes(createdCertId1));
      assert.ok(ids.includes(createdCertId2));
    });

    test('should filter certifications by name search', async () => {
      const res = await callProcedure(certifications.getByCompany, {
        organizationId: testOrgId,
        name: 'AWS',
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdCertId1);
    });

    test('should filter certifications by category', async () => {
      const res = await callProcedure(certifications.getByCompany, {
        organizationId: testOrgId,
        category: 'PROJECTMANAGEMENT',
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdCertId2);
    });
  });

  describe('GET /certifications (GetAll)', () => {
    test('should successfully return all certifications', async () => {
      const res = await callProcedure(certifications.getAll);
      assert.ok(Array.isArray(res));
      assert.ok(res.length >= 2);
    });
  });

  describe('GET /certifications/{certificationId} (GetById)', () => {
    test('should throw NOT_FOUND for a non-existent ID', async () => {
      await assert.rejects(
        callProcedure(certifications.getById, {
          certificationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should successfully return the certification by its ID', async () => {
      const res = await callProcedure(certifications.getById, {
        certificationId: createdCertId1,
      });

      assert.strictEqual(res.id, createdCertId1);
      assert.strictEqual(res.name, 'Integration Test AWS Certification');
    });
  });

  describe('PUT /certifications/{certificationId} (Update)', () => {
    test('should throw NOT_FOUND for a non-existent ID', async () => {
      await assert.rejects(
        callProcedure(certifications.update, {
          certificationId: randomUUID(),
          name: 'Updated Name',
          serialNumber: 'SN-111',
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should successfully replace the certification completely', async () => {
      const res = await callProcedure(certifications.update, {
        certificationId: createdCertId1,
        name: 'Updated AWS Certification Name',
        serialNumber: 'AWS-INTEG-111-UPDATED',
        issuing_organization_id: testOrgId,
      });

      assert.strictEqual(res.id, createdCertId1);
      assert.strictEqual(res.name, 'Updated AWS Certification Name');
      assert.strictEqual(res.serialNumber, 'AWS-INTEG-111-UPDATED');
    });
  });

  describe('DELETE /certifications/{certificationId} (Delete)', () => {
    test('should throw NOT_FOUND for a non-existent ID', async () => {
      await assert.rejects(
        callProcedure(certifications.delete, {
          certificationId: randomUUID(),
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should successfully delete a certification by ID', async () => {
      const res = await callProcedure(certifications.delete, {
        certificationId: createdCertId1,
      });

      assert.strictEqual(res.id, createdCertId1);

      // Verify it's no longer in the DB
      await assert.rejects(
        callProcedure(certifications.getById, {
          certificationId: createdCertId1,
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );

      createdCertId1 = ''; // Clear for teardown
    });
  });

  describe('DELETE /certifications/bulk (DeleteBulk)', () => {
    test('should successfully bulk delete certifications by IDs', async () => {
      const res = await callProcedure(certifications.deleteBulk, {
        ids: [createdCertId2],
      });

      assert.ok(Array.isArray(res));
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].id, createdCertId2);

      // Verify it's no longer in the DB
      await assert.rejects(
        callProcedure(certifications.getById, {
          certificationId: createdCertId2,
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );

      createdCertId2 = ''; // Clear for teardown
    });
  });
});
