import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "./db/types";

const { Pool } = pg;

let dialect: any;
export let pgliteClient: any = null;

if (process.env.NODE_ENV === "test") {
  const { PGlite } = await import("@electric-sql/pglite");
  const { PGliteDialect } = await import("kysely");

  pgliteClient = new PGlite();

  dialect = new PGliteDialect({
    pglite: pgliteClient,
  });
} else {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing. Start the API through src/bootstrap.ts.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    ssl: connectionString.includes("localhost")
      ? false
      : {
          rejectUnauthorized: false,
        },
  });

  try {
    const result = await pool.query(
      `SELECT oid
       FROM pg_type
       WHERE typname = '_Language'`,
    );

    if (result.rows.length > 0) {
      const oid = result.rows[0].oid;

      pg.types.setTypeParser(
        oid,
        pg.types.getTypeParser(1009 as any),
      );
    }
  } catch (error) {
    console.error(
      "Failed to register custom enum array parser:",
      error,
    );
  }

  dialect = new PostgresDialect({
    pool,
  });
}

export const database = new Kysely<DB>({
  dialect,
});

if (process.env.NODE_ENV === "test") {
  const originalDestroy = database.destroy.bind(database);

  database.destroy = async () => {
    // Keep the shared test database alive.
  };

  (database as any).realDestroy = originalDestroy;

  if (pgliteClient) {
    const originalExec = pgliteClient.exec.bind(pgliteClient);
    let schemaLoaded = false;

    pgliteClient.exec = async (
      sql: string,
      options?: any,
    ) => {
      const createsTable = /create\s+table/i.test(sql);

      if (createsTable) {
        if (schemaLoaded) {
          return [];
        }

        schemaLoaded = true;
      }

      return originalExec(sql, options);
    };
  }
}