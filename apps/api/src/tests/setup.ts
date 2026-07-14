// src/tests/setup.ts
process.env.NODE_ENV = "test";
import { after } from "node:test";
import { setup } from "./global-setup";
import { database, pgliteClient } from "../database";

await setup();

after(async () => {
  if (pgliteClient) {
    try {
      await pgliteClient.close();
    } catch (e) {
      // Ignore
    }
  }
  try {
    if ((database as any).realDestroy) {
      await (database as any).realDestroy();
    } else {
      await database.destroy();
    }
  } catch (e) {
    // Ignore
  }
});
