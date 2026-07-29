#!/usr/bin/env -S npx tsx
// Incremental Excel/CSV -> DB import CLI (Phase 1 - see the task prompt for
// the full design). Dry-run by default; nothing is written to the database
// unless --commit is passed.
//
// Usage:
//   tsx scripts/import.ts --model Country --file ../data/countries.csv
//   tsx scripts/import.ts --model Country --file ../data/countries.csv --commit
//   tsx scripts/import.ts --all [--commit] [--allow-partial] [--prune] [--force-prune]
//
// Must be run with apps/api as the working directory (same convention as
// `npm run seed`) so --all's default data directory resolves correctly.

import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { ADAPTERS, findAdapterByModelName } from "../prisma/import/adapters/index";
import { PRUNE_RATIO_LIMIT, runImportForModel } from "../prisma/import/run";
import type { RunResult } from "../prisma/import/run";
import type { ImportAdapter, CsvRow } from "../prisma/import/types";

interface Args {
  model?: string | undefined;
  file?: string | undefined;
  all: boolean;
  commit: boolean;
  allowPartial: boolean;
  prune: boolean;
  forcePrune: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { all: false, commit: false, allowPartial: false, prune: false, forcePrune: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--model") args.model = argv[++i];
    else if (arg === "--file") args.file = argv[++i];
    else if (arg === "--all") args.all = true;
    else if (arg === "--commit") args.commit = true;
    else if (arg === "--allow-partial") args.allowPartial = true;
    else if (arg === "--prune") args.prune = true;
    // --force-prune implique --prune : passer outre le seuil de sécurité
    // n'a de sens que si l'on élague effectivement.
    else if (arg === "--force-prune") {
      args.prune = true;
      args.forcePrune = true;
    }
    else {
      throw new Error(`Argument inconnu: ${arg}`);
    }
  }

  return args;
}

function printPlanSummary(adapter: ImportAdapter<CsvRow, unknown>, result: RunResult) {
  const { plan } = result;

  console.log(`\n=== ${adapter.modelName} (${adapter.csvFile}) ===`);

  if (plan.headerError) {
    console.log(`REJETÉ: en-tête du fichier désynchronisé du schéma actuel.`);
    if (plan.headerError.missing.length) {
      console.log(`  Colonnes manquantes: ${plan.headerError.missing.join(", ")}`);
    }
    if (plan.headerError.extra.length) {
      console.log(`  Colonnes inattendues: ${plan.headerError.extra.join(", ")}`);
    }
    return;
  }

  console.log(
    `A créer: ${plan.toInsert.length} | A mettre à jour: ${plan.toUpdate.length} | ` +
      `Inchangées: ${plan.unchanged.length} | En erreur: ${plan.rowErrors.length} | ` +
      `Orphelines (non touchées): ${plan.orphans.length}`,
  );

  if (plan.duplicateNaturalKeys.size > 0) {
    console.log(`Clés naturelles dupliquées dans le fichier:`);
    for (const [key, rows] of plan.duplicateNaturalKeys) {
      console.log(`  "${key}": lignes ${rows.join(", ")}`);
    }
  }

  if (plan.rowErrors.length > 0) {
    console.log(`Erreurs:`);
    for (const issue of plan.rowErrors) {
      console.log(`  ligne ${issue.row} [${issue.naturalKey ?? "?"}] ${issue.column ?? ""}: ${issue.message}`);
    }
  }

  if (plan.rowWarnings.length > 0) {
    console.log(`Avertissements:`);
    for (const issue of plan.rowWarnings) {
      console.log(`  ligne ${issue.row} [${issue.naturalKey ?? "?"}] ${issue.column ?? ""}: ${issue.message}`);
    }
  }

  if (plan.orphans.length > 0) {
    console.log(`Orphelines (en base mais absentes du fichier, non touchées): ${plan.orphans.join(", ")}`);
  }

  if (result.m2mWarnings.length > 0) {
    console.log(`Relations non résolues:`);
    for (const w of result.m2mWarnings) console.log(`  ${w}`);
  }

  if (result.pruneRefused) {
    const { orphans, tracked, ratio } = result.pruneRefused;
    console.log(
      `--prune REFUSÉ: ${orphans}/${tracked} clés suivies absentes du fichier ` +
        `(${(ratio * 100).toFixed(1)}%, seuil ${(PRUNE_RATIO_LIMIT * 100).toFixed(0)}%). ` +
        `Fichier tronqué ou mauvais onglet Excel ? Relancer avec --force-prune si c'est voulu.`,
    );
  }

  switch (result.skippedReason) {
    case "header_mismatch":
      break;
    case "row_errors_reject_all":
      console.log(`REJETÉ: fichier entier rejeté (erreurs présentes, --allow-partial non passé).`);
      break;
    case "dry_run":
      console.log(`DRY-RUN: aucune écriture (relancer avec --commit pour appliquer).`);
      break;
    default:
      console.log(
        `COMMIT: ${plan.toInsert.length} créées, ${plan.toUpdate.length} mises à jour` +
          (result.prunedCount > 0 ? `, ${result.prunedCount} soft-supprimées (--prune)` : ""),
      );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.all && !args.model) {
    throw new Error("Précisez --model <Nom> --file <chemin> ou --all.");
  }

  const dataDir = path.resolve(process.cwd(), "data");
  const prisma = new PrismaClient();

  const targets: { adapter: ImportAdapter<CsvRow, unknown>; filePath: string }[] = [];

  if (args.all) {
    for (const adapter of ADAPTERS) {
      targets.push({ adapter, filePath: path.join(dataDir, adapter.csvFile) });
    }
  } else {
    const adapter = findAdapterByModelName(args.model!);
    if (!adapter) {
      throw new Error(
        `Modèle inconnu: "${args.model}". Modèles disponibles: ${ADAPTERS.map((a) => a.modelName).join(", ")}`,
      );
    }
    if (!args.file) {
      throw new Error("--file <chemin> est requis avec --model.");
    }
    targets.push({ adapter, filePath: path.resolve(process.cwd(), args.file) });
  }

  let anyRejected = false;

  try {
    for (const { adapter, filePath } of targets) {
      const result = await runImportForModel(prisma, adapter, filePath, {
        commit: args.commit,
        allowPartial: args.allowPartial,
        prune: args.prune,
        forcePrune: args.forcePrune,
        sourceFile: path.basename(filePath),
      });

      printPlanSummary(adapter, result);

      if (result.skippedReason === "header_mismatch" || result.skippedReason === "row_errors_reject_all") {
        anyRejected = true;
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  if (anyRejected) {
    console.log(`\nUn ou plusieurs modèles ont été rejetés - voir le détail ci-dessus.`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("Import échoué:", e);
  process.exit(1);
});
