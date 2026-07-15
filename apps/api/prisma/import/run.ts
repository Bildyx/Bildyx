import type { PrismaClient } from "@prisma/client";
import { loadCsvFile } from "./csv";
import { planImport } from "./plan";
import type { ImportPlan } from "./plan";
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
// (pure) -> optionally execute inside a single transaction. This is the
// only piece of the engine that touches PrismaClient, so it's callable
// straight from a CLI script today and, unchanged, from an Express route
// handler later (see the prompt's Phase 2 notes) without needing a
// rewrite.
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

  let prunedCount = 0;

  await prisma.$transaction(async (tx) => {
    const client = tx as unknown as PrismaTransactionClient;
    const delegate = client[adapter.prismaModel];
    const now = new Date();

    const written: { naturalKey: string; rowHash: string; data: Record<string, unknown>; row: CsvRow }[] = [];

    for (const planned of plan.toInsert) {
      await delegate.create({ data: planned.data });
      written.push(planned);
    }
    for (const planned of plan.toUpdate) {
      await delegate.update({
        where: { [adapter.naturalKeyField]: planned.naturalKey },
        data: planned.data,
      });
      written.push(planned);
    }

    if (adapter.afterUpsert) {
      await adapter.afterUpsert(client, written, fkContext);
    }

    for (const planned of written) {
      await client.importRowHash.upsert({
        where: {
          modelName_naturalKey: {
            modelName: adapter.modelName,
            naturalKey: planned.naturalKey,
          },
        },
        create: {
          modelName: adapter.modelName,
          naturalKey: planned.naturalKey,
          rowHash: planned.rowHash,
          lastImportedAt: now,
          sourceFile: options.sourceFile,
        },
        update: {
          rowHash: planned.rowHash,
          lastImportedAt: now,
          sourceFile: options.sourceFile,
        },
      });
    }

    if (options.prune) {
      for (const naturalKey of plan.orphans) {
        await delegate.update({
          where: { [adapter.naturalKeyField]: naturalKey },
          data: { [adapter.deletedAtField]: now },
        });
        await client.importRowHash.deleteMany({
          where: { modelName: adapter.modelName, naturalKey },
        });
        prunedCount++;
      }
    }
  });

  return { plan, committed: true, prunedCount };
}
