import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Contenu des questionnaires de personnalite : un fichier JSON par test dans
// prisma/seeds/personality/. Ces donnees sont de la configuration (elles ne
// dependent d'aucun utilisateur) et ne passent pas par le pipeline
// Excel/CSV de prisma/import/ : ce moteur suppose une cle naturelle sur une
// seule colonne et un champ de soft-delete, or PersonalityCriterion est
// unique sur (test_id, code), PersonalityQuestion sur (test_id, order), et
// aucun des trois modeles n'a de colonne deleted_at.
//
// Le seeder est idempotent : il fait un upsert sur la cle naturelle de
// chaque niveau, donc le relancer apres avoir modifie un JSON met la base a
// jour au lieu de dupliquer. Les lignes presentes en base mais absentes du
// JSON sont signalees, jamais supprimees (une question peut deja porter des
// reponses utilisateur).

// Resolu depuis ce fichier et non depuis le cwd, pour que le seeder tourne
// aussi bien via `npm run seed:personality` que depuis `prisma db seed`.
const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), "personality");

const criterionSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  order: z.int().positive(),
});

const questionSchema = z.object({
  order: z.int().positive(),
  criterion_code: z.string().min(1),
  text: z.string().min(1),
  reverse_scored: z.boolean(),
});

const testSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  criteria: z.array(criterionSchema).min(1),
  questions: z.array(questionSchema).min(1),
});

type PersonalityTestContent = z.infer<typeof testSchema>;

function duplicates<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const dupes = new Set<T>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  return [...dupes];
}

/**
 * Valide les invariants que Zod ne peut pas exprimer seul, et qui
 * correspondent exactement aux contraintes de schema.prisma : unicite de
 * (test, code) sur les criteres, unicite de (test, order) sur les questions,
 * et FK criterion_id resolvable dans le test courant.
 */
function validateContent(test: PersonalityTestContent, file: string): void {
  const fail = (message: string): never => {
    throw new Error(`${file}: ${message}`);
  };

  const criterionCodes = test.criteria.map((c) => c.code);
  const dupCriteria = duplicates(criterionCodes);
  if (dupCriteria.length > 0) {
    fail(`code de critere en double : ${dupCriteria.join(", ")}`);
  }

  const dupCriterionOrders = duplicates(test.criteria.map((c) => c.order));
  if (dupCriterionOrders.length > 0) {
    fail(`order de critere en double : ${dupCriterionOrders.join(", ")}`);
  }

  const dupOrders = duplicates(test.questions.map((q) => q.order));
  if (dupOrders.length > 0) {
    fail(`order de question en double : ${dupOrders.join(", ")}`);
  }

  const orders = test.questions.map((q) => q.order).sort((a, b) => a - b);
  const expected = orders.map((_, i) => i + 1);
  if (orders.join(",") !== expected.join(",")) {
    fail(
      `les order de questions doivent etre 1..${test.questions.length} sans trou (recu : ${orders.join(", ")})`,
    );
  }

  const known = new Set(criterionCodes);
  for (const q of test.questions) {
    if (!known.has(q.criterion_code)) {
      fail(
        `question ${q.order} : criterion_code "${q.criterion_code}" inconnu (critere declares : ${criterionCodes.join(", ")})`,
      );
    }
  }
}

export function loadPersonalityContent(): PersonalityTestContent[] {
  const files = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const tests = files.map((file) => {
    const raw: unknown = JSON.parse(
      readFileSync(join(CONTENT_DIR, file), "utf-8"),
    );
    const parsed = testSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`${file}: JSON invalide - ${parsed.error.message}`);
    }
    validateContent(parsed.data, file);
    return parsed.data;
  });

  const dupTests = duplicates(tests.map((t) => t.code));
  if (dupTests.length > 0) {
    throw new Error(
      `code de test en double entre plusieurs fichiers : ${dupTests.join(", ")}`,
    );
  }

  return tests;
}

export async function seedPersonalityTests(prisma: PrismaClient) {
  const tests = loadPersonalityContent();

  for (const test of tests) {
    const row = await prisma.personalityTest.upsert({
      where: { code: test.code },
      create: {
        code: test.code,
        name: test.name,
        description: test.description ?? null,
        is_active: test.is_active,
      },
      update: {
        name: test.name,
        description: test.description ?? null,
        is_active: test.is_active,
      },
    });

    const criterionIdByCode = new Map<string, string>();
    for (const criterion of test.criteria) {
      const saved = await prisma.personalityCriterion.upsert({
        where: { test_id_code: { test_id: row.id, code: criterion.code } },
        create: {
          test_id: row.id,
          code: criterion.code,
          name: criterion.name,
          description: criterion.description ?? null,
          order: criterion.order,
        },
        update: {
          name: criterion.name,
          description: criterion.description ?? null,
          order: criterion.order,
        },
      });
      criterionIdByCode.set(criterion.code, saved.id);
    }

    for (const question of test.questions) {
      // validateContent a deja garanti que le code existe.
      const criterionId = criterionIdByCode.get(question.criterion_code) as string;
      await prisma.personalityQuestion.upsert({
        where: { test_id_order: { test_id: row.id, order: question.order } },
        create: {
          test_id: row.id,
          criterion_id: criterionId,
          order: question.order,
          text: question.text,
          reverse_scored: question.reverse_scored,
        },
        update: {
          criterion_id: criterionId,
          text: question.text,
          reverse_scored: question.reverse_scored,
        },
      });
    }

    // Lignes en base qui ne sont plus dans le JSON : signalees seulement.
    // Les supprimer casserait la FK depuis personality_answers si un
    // utilisateur a deja repondu.
    const orphanQuestions = await prisma.personalityQuestion.findMany({
      where: { test_id: row.id, order: { gt: test.questions.length } },
      select: { order: true },
    });
    const orphanCriteria = await prisma.personalityCriterion.findMany({
      where: { test_id: row.id, code: { notIn: test.criteria.map((c) => c.code) } },
      select: { code: true },
    });

    console.log(
      `  ${test.code}: ${test.criteria.length} critere(s), ${test.questions.length} question(s)`,
    );
    if (orphanQuestions.length > 0) {
      console.warn(
        `    /!\\ ${orphanQuestions.length} question(s) en base absente(s) du JSON (order ${orphanQuestions
          .map((q) => q.order)
          .join(", ")}) - laissees en place, a supprimer a la main si besoin`,
      );
    }
    if (orphanCriteria.length > 0) {
      console.warn(
        `    /!\\ critere(s) en base absent(s) du JSON : ${orphanCriteria
          .map((c) => c.code)
          .join(", ")} - laisse(s) en place`,
      );
    }
  }

  const totalQuestions = tests.reduce((n, t) => n + t.questions.length, 0);
  console.log(
    `Personality tests seeded: ${tests.length} test(s), ${totalQuestions} question(s).`,
  );
}
