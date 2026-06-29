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
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

  // Register standard text array parser for the custom enum array _Language OID dynamically
  try {
    const res = await pool.query("SELECT oid FROM pg_type WHERE typname = '_Language'");
    if (res.rows.length > 0) {
      const oid = res.rows[0].oid;
      pg.types.setTypeParser(oid, pg.types.getTypeParser(1009 as any));
    }
  } catch (err) {
    console.error("Failed to register custom enum array parser:", err);
  }

  dialect = new PostgresDialect({
    pool,
  });
}

export const database = new Kysely<DB>({
  dialect,
});
