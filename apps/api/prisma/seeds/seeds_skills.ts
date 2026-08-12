import { PrismaClient, Prisma, DifficultyLevel } from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
} from "../seed-utils";

import { Skill } from "../../src/models/skills";

type SkillCsv = Partial<Record<keyof Skill, string>>;

export async function seedSkills(prisma: PrismaClient) {
  const rows = readCsv<SkillCsv>("skills.csv");

  const data: Prisma.SkillCreateManyInput[] = rows.map((r) => ({
    id: r.id!,
    name: r.name!,
    serial_number: r.serial_number!,

    type: r.type || null,

    // "category" may hold several comma-separated values, but Skill.category
    // is a plain text field -> stored as-is.
    category: r.category || null,

    description: r.description || null,
    iconUrl: r.icon_url || null,
    industry: r.industry || null,

    difficulty: parseEnum(r.difficulty, DifficultyLevel),

    usedIn: toStringArray(r.used_in),
    jobs: toStringArray(r.jobs),
    productCategories: toStringArray(r.product_categories),
    commonFieldsOfStudy: toStringArray(r.common_fields_of_study),
    relatedAbilities: toStringArray(r.related_abilities),

    timeToMaster: r.time_to_master || null,

    score: r.score && r.score !== "" ? Number(r.score) : null,
  }));

  const result = await prisma.skill.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Skills rows imported: ${result.count}`);

  return result.count;
}
