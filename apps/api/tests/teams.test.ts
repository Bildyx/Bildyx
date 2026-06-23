import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { teams } from '../src/routes/teams';
import { database } from '../src/database';
import { ORPCError } from '@orpc/server';
import { randomUUID } from 'node:crypto';

describe('Teams & Members API Endpoints', () => {
  let testCompanyId: string;
  let testCompanyAccountId: string;
  let createdTeamId: string;

  before(async () => {
    // Setup temporary company and company_account for testing
    testCompanyId = randomUUID();
    testCompanyAccountId = randomUUID();

    await database.insertInto('companies')
      .values({
        id: testCompanyId,
        organization_name: 'Integration Test Company',
        updated_at: new Date()
      })
      .execute();

    await database.insertInto('company_accounts')
      .values({
        id: testCompanyAccountId,
        company_id: testCompanyId,
        contact_email: 'test@integration.com',
        is_active: true,
        updated_at: new Date()
      })
      .execute();
  });

  after(async () => {
    // Clean up all test data in reverse order
    try {
      if (createdTeamId) {
        await database.deleteFrom('team_members').where('team_id', '=', createdTeamId).execute();
        await database.deleteFrom('teams').where('id', '=', createdTeamId).execute();
      }
      await database.deleteFrom('company_accounts').where('id', '=', testCompanyAccountId).execute();
      await database.deleteFrom('companies').where('id', '=', testCompanyId).execute();
    } catch (err) {
      console.error("Cleanup error in test teardown:", err);
    } finally {
      await database.destroy();
    }
  });

  const callCreateTeam = async (input: any) => {
    const schema = (teams.create as any)['~orpc']?.inputSchema;
    const validatedInput = schema ? schema.parse(input) : input;
    const handler = (teams.create as any)['~orpc']?.handler;
    return await handler({ input: validatedInput });
  };

  const callAddMember = async (input: any) => {
    const schema = (teams.addMember as any)['~orpc']?.inputSchema;
    const validatedInput = schema ? schema.parse(input) : input;
    const handler = (teams.addMember as any)['~orpc']?.handler;
    return await handler({ input: validatedInput });
  };

  describe('POST /teams (Create Team)', () => {
    test('should throw NOT_FOUND when company account does not exist', async () => {
      await assert.rejects(
        callCreateTeam({
          company_account_id: randomUUID(),
          name: 'Some Team',
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should throw ZodError when team name is empty or only whitespace', async () => {
      await assert.rejects(
        callCreateTeam({
          company_account_id: testCompanyAccountId,
          name: '   ',
        }),
        (err: any) => err.name === 'ZodError'
      );
    });

    test('should successfully create a team and return database defaults', async () => {
      const name = `Test Team ${Date.now()}`;
      const res = await callCreateTeam({
        company_account_id: testCompanyAccountId,
        name,
        who_we_are: 'Some description',
      });

      assert.ok(res.id);
      assert.ok(res.updated_at);
      assert.strictEqual(res.name, name);
      createdTeamId = res.id;
    });

    test('should throw CONFLICT when trying to create a duplicate team name for the same company', async () => {
      const team = await database.selectFrom('teams').where('id', '=', createdTeamId).selectAll().executeTakeFirst();
      assert.ok(team);

      await assert.rejects(
        callCreateTeam({
          company_account_id: testCompanyAccountId,
          name: team.name,
        }),
        (err: any) => err instanceof ORPCError && err.code === 'CONFLICT'
      );
    });
  });

  describe('POST /teams/{team_id}/members (Add Member)', () => {
    test('should throw NOT_FOUND when team does not exist', async () => {
      await assert.rejects(
        callAddMember({
          team_id: randomUUID(),
          name: 'John Doe',
          job_title: 'Developer',
        }),
        (err: any) => err instanceof ORPCError && err.code === 'NOT_FOUND'
      );
    });

    test('should throw ZodError when member name is empty', async () => {
      await assert.rejects(
        callAddMember({
          team_id: createdTeamId,
          name: '   ',
          job_title: 'Developer',
        }),
        (err: any) => err.name === 'ZodError'
      );
    });

    test('should throw ZodError when member job_title/role is empty', async () => {
      await assert.rejects(
        callAddMember({
          team_id: createdTeamId,
          name: 'John Doe',
          job_title: '   ',
        }),
        (err: any) => err.name === 'ZodError'
      );
    });

    test('should successfully add a member and return generated id', async () => {
      const res = await callAddMember({
        team_id: createdTeamId,
        name: '  John Doe  ',
        job_title: '  Developer  ',
        sort_order: 1,
      });

      assert.ok(res.id);
      assert.strictEqual(res.name, 'John Doe');
      assert.strictEqual(res.job_title, 'Developer');
    });

    test('should throw CONFLICT when duplicate member name is added to the same team', async () => {
      await assert.rejects(
        callAddMember({
          team_id: createdTeamId,
          name: 'john doe',
          job_title: 'Another Role',
        }),
        (err: any) => err instanceof ORPCError && err.code === 'CONFLICT'
      );
    });
  });
});
