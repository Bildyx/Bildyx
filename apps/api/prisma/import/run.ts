import type { PrismaClient } from "@prisma/client";
import { CHUNK_SIZE, chunk, runBatched } from "./batch";
import { loadCsvFile } from "./csv";
import { planImport } from "./plan";
import type { ImportPlan, PlannedRow } from "./plan";
import { toStringArray } from "../seed-utils";
import type { CsvRow, ImportAdapter, M2mColumn, PrismaTransactionClient } from "./types";

// Au-delà de cette proportion d'orphelines, --prune s'arrête au lieu de
// soft-supprimer. Sans ce seuil, un CSV tronqué, vide, ou converti depuis le
// mauvais onglet Excel soft-supprimait l'intégralité du modèle sans la
// moindre confirmation. --force-prune permet de passer outre sciemment.
export const PRUNE_RATIO_LIMIT = 0.2;

export interface RunOptions {
  commit: boolean;
  allowPartial: boolean;
  prune: boolean;
  forcePrune: boolean;
  sourceFile: string;
}

export type SkipReason = "header_mismatch" | "row_errors_reject_all" | "dry_run";

export interface RunResult {
  plan: ImportPlan<CsvRow>;
  committed: boolean;
  skippedReason?: SkipReason;
  prunedCount: number;
  // Renseigné quand --prune a été refusé par le seuil de sécurité.
  pruneRefused?: { orphans: number; tracked: number; ratio: number };
  // Références M2M non résolues, remontées comme avertissements.
  m2mWarnings: string[];
}

// Résout une colonne M2M pour toutes les lignes écrites, puis pose les
// liens. `set` plutôt que `connect` : un réimport doit refléter exactement
// le contenu du fichier, y compris la suppression d'un lien retiré de la
// cellule - `connect` ne sait qu'ajouter, ce qui rendait l'import non
// idempotent sur ces colonnes.
async function applyM2mLinks(
  client: PrismaTransactionClient,
  adapter: ImportAdapter<CsvRow, unknown>,
  m2m: M2mColumn,
  written: PlannedRow<CsvRow>[],
  warnings: string[],
): Promise<void> {
  const targets: Record<string, unknown>[] = await client[m2m.targetModel].findMany({
    select: { [m2m.targetLookupField]: true, [m2m.targetConnectField]: true },
  });

  const byLookup = new Map<string, unknown>();
  const ambiguous = new Set<string>();
  for (const t of targets) {
    const key = String(t[m2m.targetLookupField] ?? "").trim().toLowerCase();
    if (!key) continue;
    if (byLookup.has(key)) ambiguous.add(key);
    byLookup.set(key, t[m2m.targetConnectField]);
  }

  const updates: { naturalKey: string; connect: Record<string, unknown>[] }[] = [];

  for (const planned of written) {
    const cell = planned.row[m2m.column];
    const tokens = toStringArray(cell);
    // Cellule vide : on pose quand même `set: []` pour que le retrait de
    // toutes les valeurs soit répercuté.
    const connect: Record<string, unknown>[] = [];
    const seen = new Set<unknown>();

    for (const token of tokens) {
      const key = token.trim().toLowerCase();
      const resolved = byLookup.get(key);
      if (resolved === undefined) {
        warnings.push(`[${planned.naturalKey}] ${m2m.column}: "${token}" non résolu (ignoré)`);
        continue;
      }
      if (ambiguous.has(key)) {
        warnings.push(
          `[${planned.naturalKey}] ${m2m.column}: "${token}" ambigu (plusieurs ${m2m.targetModel} portent ce ${m2m.targetLookupField}), lien ignoré`,
        );
        continue;
      }
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      connect.push({ [m2m.targetConnectField]: resolved });
    }

    updates.push({ naturalKey: planned.naturalKey, connect });
  }

  await runBatched(updates, ({ naturalKey, connect }) =>
    client[adapter.prismaModel].update({
      where: { [adapter.naturalKeyField]: naturalKey },
      data: { [m2m.relationField]: { set: connect } },
    }),
  );
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
    return { plan, committed: false, skippedReason: "header_mismatch", prunedCount: 0, m2mWarnings: [] };
  }

  if (plan.rowErrors.length > 0 && !options.allowPartial) {
    return { plan, committed: false, skippedReason: "row_errors_reject_all", prunedCount: 0, m2mWarnings: [] };
  }

  if (!options.commit) {
    return { plan, committed: false, skippedReason: "dry_run", prunedCount: 0, m2mWarnings: [] };
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

  // Relations M2M : posées après afterUpsert (les cibles peuvent provenir
  // de n'importe quel chunk) et avant l'enregistrement des hash, pour qu'un
  // plantage ici rejoue les lignes au run suivant au lieu de les considérer
  // à jour.
  const m2mWarnings: string[] = [];
  for (const m2m of adapter.m2mColumns ?? []) {
    await applyM2mLinks(client, adapter, m2m, written, m2mWarnings);
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

  let pruneRefused: RunResult["pruneRefused"];
  if (options.prune) {
    // Nombre de clés suivies avant ce run : orphelines + lignes retrouvées
    // dans le fichier. Un fichier tronqué fait grimper le ratio.
    const tracked = plan.orphans.length + plan.toUpdate.length + plan.unchanged.length;
    const ratio = tracked > 0 ? plan.orphans.length / tracked : 0;
    if (!options.forcePrune && plan.orphans.length > 0 && ratio > PRUNE_RATIO_LIMIT) {
      pruneRefused = { orphans: plan.orphans.length, tracked, ratio };
    }
  }

  if (options.prune && !pruneRefused) {
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

  return { plan, committed: true, prunedCount, ...(pruneRefused ? { pruneRefused } : {}), m2mWarnings };
}
