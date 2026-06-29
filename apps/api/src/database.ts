import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { DB } from './db/types';
import 'dotenv/config';

const { Pool } = pg;

let dialect: any;
export let pgliteClient: any = null;

if (process.env.NODE_ENV === 'test') {
  const { PGlite } = await import('@electric-sql/pglite');
  const { PGliteDialect } = await import('kysely');
  pgliteClient = new PGlite();
  dialect = new PGliteDialect({
    pglite: pgliteClient,
  });
} else {
  dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    })
  });
}

export const database = new Kysely<DB>({
  dialect,
});
