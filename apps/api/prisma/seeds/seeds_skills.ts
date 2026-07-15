import { PrismaClient, Prisma, DifficultyLevel } from "@prisma/client";
import {
  readCsv,
  toJson,
  toDate,
  toStringArray,
  parseEnum,
} from "../seed-utils";

type SkillCsv = {
  id: string;
  name: string;
  serial_number: string;
  type?: string;
  categories?: string;
  description?: string;
  icon_url?: string;
  industry?: string;
  difficulty?: string;
  used_in?: string;
  jobs?: string;
  product_categories?: string;
  common_fields_of_study?: string;
  related_abilities?: string;
  time_to_master?: string;
  score?: string;
  metadata?: string;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};

export async function seedSkills(prisma: PrismaClient) {
  const rows = readCsv<SkillCsv>("skills.csv");

  const data: Prisma.SkillCreateManyInput[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    serial_number: r.serial_number,

    type: r.type || null,

    // "categories" est une colonne CSV multi-valeurs (comma-separated), mais
    // Skill.category est un simple champ texte -> stockee telle quelle.
    category: r.categories || null,

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

    metadata: toJson(r.metadata),

    deletedAt: toDate(r.deleted_at, false),
    createdAt: toDate(r.created_at, true) as Date,
    updatedAt: toDate(r.updated_at, true) as Date,
  }));

  const result = await prisma.skill.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Skills rows imported: ${result.count}`);

  return result.count;
}
