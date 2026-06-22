import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from './db/types';
import 'dotenv/config';

const { Pool } = pg;

export const database = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    })
  })
});
