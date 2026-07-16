import type { PrismaClient } from "@prisma/client";
import { CHUNK_SIZE, chunk, runBatched } from "./batch";
import { loadCsvFile } from "./csv";
import { planImport } from "./plan";
import type { ImportPlan, PlannedRow } from "./plan";
import type { CsvRow, ImportAdapter, PrismaTransactionClient } from "./types";

export interface RunOptions {
  commit: boolean;
  allowPartial: boolean;
  prune: boolean;
  sourceFile: string;
}

export type SkipReason = "header_mismatch" | "row_errors_reject_all" | "dry_run";

export interface RunResult {
  plan: ImportPlan<CsvRow>;
  committed: boolean;
  skippedReason?: SkipReason;
  prunedCount: number;
}

async function loadExistingHashes(
  prisma: PrismaClient,
  modelName: string,
): Promise<Map<string, string>> {
  const rows = await (prisma as any).importRowHash.findMany({
    where: { modelName },
    select: { naturalKey: true, rowHash: true },
  });
  return new Map(rows.map((r: any) => [r.naturalKey, r.rowHash]));
}

// Orchestrates one model's import: load CSV -> build FK context -> plan
// (pure) -> optionally execute. This is the only piece of the engine that
// touches PrismaClient, so it's callable straight from a CLI script today
// and, unchanged, from an Express route handler later (see the prompt's
// Phase 2 notes) without needing a rewrite.
//
// Execution is chunked rather than wrapped in one interactive transaction:
// files can reach ~200k rows and one round-trip per row inside a single
// transaction both blows Prisma's transaction timeout (P2028) and holds a
// pooler connection for hours. Atomicity is traded for idempotence: row
// hashes are only recorded after their data rows are written, so a run that
// dies mid-way simply re-classifies the missing rows on the next run and
// finishes the job (see the self-healing note on the insert path below).
export async function runImportForModel(
  prisma: PrismaClient,
  adapter: ImportAdapter<CsvRow, unknown>,
  filePath: string,
  options: RunOptions,
): Promise<RunResult> {
  const { header, rows } = loadCsvFile(filePath);
  const fkContext = await adapter.buildFkContext(prisma, rows);
  const existingHashes = await loadExistingHashes(prisma, adapter.modelName);

  const plan = planImport(header, rows, adapter, fkContext, existingHashes);

  if (plan.headerError) {
    return { plan, committed: false, skippedReason: "header_mismatch", prunedCount: 0 };
  }

  if (plan.rowErrors.length > 0 && !options.allowPartial) {
    return { plan, committed: false, skippedReason: "row_errors_reject_all", prunedCount: 0 };
  }

  if (!options.commit) {
    return { plan, committed: false, skippedReason: "dry_run", prunedCount: 0 };
  }

  const client = prisma as unknown as PrismaTransactionClient;
  const delegate = client[adapter.prismaModel];
  const now = new Date();

  let prunedCount = 0;
  const written: PlannedRow<CsvRow>[] = [];

  // Inserts: bulk createMany per chunk. A row planned as an insert may still
  // already exist in the target table (e.g. it was seeded by the legacy
  // npm run seed script, or ImportRowHash was never backfilled / a previous
  // run died before recording hashes) - createMany would silently skip those
  // and leave them stale, so each chunk first asks the DB which keys exist
  // and routes them through update instead. This keeps the old upsert
  // semantics at bulk speed.
  for (const batch of chunk(plan.toInsert, CHUNK_SIZE)) {
    const keys = batch.map((p) => p.naturalKey);
    const existing = await delegate.findMany({
      where: { [adapter.naturalKeyField]: { in: keys } },
      select: { [adapter.naturalKeyField]: true },
    });
    const existingKeys = new Set(existing.map((r: any) => r[adapter.naturalKeyField]));

    const toCreate = batch.filter((p) => !existingKeys.has(p.naturalKey));
    const toHeal = batch.filter((p) => existingKeys.has(p.naturalKey));

    if (toCreate.length > 0) {
      await delegate.createMany({
        data: toCreate.map((p) => p.data),
        skipDuplicates: true,
      });
    }
    await runBatched(toHeal, (p) =>
      delegate.update({
        where: { [adapter.naturalKeyField]: p.naturalKey },
        data: p.data,
      }),
    );
    written.push(...batch);
  }

  // Updates carry different data per row, so they can't be a single bulk
  // statement - run them concurrently instead of one round-trip at a time.
  await runBatched(plan.toUpdate, (p) =>
    delegate.update({
      where: { [adapter.naturalKeyField]: p.naturalKey },
      data: p.data,
    }),
  );
  written.push(...plan.toUpdate);

  // Runs after every data row exists (cross-row references like
  // Organization's parentOrganizationId may point at rows from any chunk),
  // and before hashes are recorded so a crash here re-runs these rows next
  // time instead of skipping them as up-to-date.
  if (adapter.afterUpsert) {
    await adapter.afterUpsert(client, written, fkContext);
  }

  // Hash bookkeeping, bulk per chunk: delete + createMany is the bulk
  // equivalent of the previous per-row upsert.
  for (const batch of chunk(written, CHUNK_SIZE)) {
    await client.importRowHash.deleteMany({
      where: {
        modelName: adapter.modelName,
        naturalKey: { in: batch.map((p) => p.naturalKey) },
      },
    });
    await client.importRowHash.createMany({
      data: batch.map((p) => ({
        modelName: adapter.modelName,
        naturalKey: p.naturalKey,
        rowHash: p.rowHash,
        lastImportedAt: now,
        sourceFile: options.sourceFile,
      })),
    });
  }

  if (options.prune) {
    for (const batch of chunk(plan.orphans, CHUNK_SIZE)) {
      const result = await delegate.updateMany({
        where: { [adapter.naturalKeyField]: { in: batch } },
        data: { [adapter.deletedAtField]: now },
      });
      await client.importRowHash.deleteMany({
        where: { modelName: adapter.modelName, naturalKey: { in: batch } },
      });
      prunedCount += result.count;
    }
  }

  return { plan, committed: true, prunedCount };
}
