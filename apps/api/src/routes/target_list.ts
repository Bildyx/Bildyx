import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { z } from "zod";
import { OrganizationSchema } from "../models/organizations";
import { zNullableUUID } from "../models/utils/preprocessors";
import {
  OrganizationSubtypeEnum,
  EmployeeCountRangeEnum,
} from "../models/utils/enums";

// ─── Input ────────────────────────────────────────────────────────────────────

const GetTargetListSchema = z.object({
  userProfileId: z.uuid(),
  matchFilter: z.enum(["same", "similar", "different"]).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sizes: z
    .preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      z.array(EmployeeCountRangeEnum),
    )
    .optional(),
  subtypes: z
    .preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      z.array(OrganizationSubtypeEnum),
    )
    .optional(),
  subject_category_id: zNullableUUID(),
  industry_id: zNullableUUID(),
});

// ─── Output : une ligne par (org, subject) ────────────────────────────────────

const TargetRowSchema = OrganizationSchema.extend({
  subject_id: z.uuid().nullable().optional(),
  subject_category_id: z.uuid().nullable().optional(),
  match_category: z.enum(["same", "similar", "different"]).optional(),
});

export const target_list = {
  getTargets: publicProcedure
    .route({
      method: "GET",
      summary: "Get target list rows for a user",
      description:
        "Returns one row per (organization, subject) pair, filtered and categorized",
      path: "/target-list",
      tags: ["TargetList"],
    })
    .input(GetTargetListSchema)
    .output(z.array(TargetRowSchema))
    .handler(async ({ input }) => {
      const {
        userProfileId,
        matchFilter,
        city,
        country,
        sizes,
        subtypes,
        subject_category_id,
        industry_id,
      } = input;

      // ── 1. Expériences de l'user ──────────────────────────────────────────
      const experiences = await database
        .selectFrom("user_experiences")
        .select(["organization_id", "subject_id"])
        .where("user_profile_id", "=", userProfileId)
        .execute();

      const expOrgIds = [
        ...new Set(
          experiences.map((e) => e.organization_id).filter(Boolean) as string[],
        ),
      ];
      const expSubjectIds = [
        ...new Set(
          experiences.map((e) => e.subject_id).filter(Boolean) as string[],
        ),
      ];

      // ── 2. Industry_id et subject_category_id des expériences ────────────
      let userIndustryIds: string[] = [];
      let userSubjectCategoryIds: string[] = [];

      if (expOrgIds.length > 0) {
        const expOrgs = await database
          .selectFrom("organizations")
          .select("industry_id")
          .where("id", "in", expOrgIds)
          .execute();
        userIndustryIds = [
          ...new Set(
            expOrgs.map((o) => o.industry_id).filter(Boolean) as string[],
          ),
        ];
      }

      if (expSubjectIds.length > 0) {
        const expSubjects = await database
          .selectFrom("subjects")
          .select("subject_category_id")
          .where("id", "in", expSubjectIds)
          .execute();
        userSubjectCategoryIds = [
          ...new Set(
            expSubjects
              .map((s) => s.subject_category_id)
              .filter(Boolean) as string[],
          ),
        ];
      }

      // ── 3. Query orgs (sans JOIN subjects) ───────────────────────────────
      let orgQuery = database
        .selectFrom("organizations")
        .leftJoin("cities", "cities.id", "organizations.city_id")
        .leftJoin("countries", "countries.iso_code", "cities.country_id")
        .selectAll("organizations")
        .$if(expOrgIds.length > 0, (q) =>
          q.where("organizations.id", "not in", expOrgIds),
        );

      if (city)
        orgQuery = orgQuery.where("cities.name", "ilike", `%${city.trim()}%`);
      if (country)
        orgQuery = orgQuery.where(
          "countries.name",
          "ilike",
          `%${country.trim()}%`,
        );
      if (sizes && sizes.length > 0)
        orgQuery = orgQuery.where(
          "organizations.numberOfEmployees",
          "in",
          sizes,
        );
      if (subtypes && subtypes.length > 0)
        orgQuery = orgQuery.where("organizations.subtype", "in", subtypes);
      if (industry_id)
        orgQuery = orgQuery.where(
          "organizations.industry_id",
          "=",
          industry_id,
        );

      // Filtre Same/Similar/Different sur les orgs
      if (matchFilter && userIndustryIds.length > 0) {
        if (matchFilter === "same" || matchFilter === "similar") {
          orgQuery = orgQuery.where(
            "organizations.industry_id",
            "in",
            userIndustryIds,
          );
        } else if (matchFilter === "different") {
          orgQuery = orgQuery.where((eb) =>
            eb.or([
              eb("organizations.industry_id", "is", null),
              eb("organizations.industry_id", "not in", userIndustryIds),
            ]),
          );
        }
      } else if (
        matchFilter &&
        userIndustryIds.length === 0 &&
        (matchFilter === "same" || matchFilter === "similar")
      ) {
        return [];
      }

      const orgs = await orgQuery
        .orderBy("organizations.name", "asc")
        .execute();
      if (orgs.length === 0) return [];

      const orgIds = orgs.map((o) => o.id);

      // ── 4. Tous les subjects de ces orgs ─────────────────────────────────
      let subjectQuery = database
        .selectFrom("subjects")
        .select(["id", "organization_id", "subject_category_id"])
        .where("organization_id", "in", orgIds);

      if (subject_category_id) {
        subjectQuery = subjectQuery.where(
          "subject_category_id",
          "=",
          subject_category_id,
        );
      }
      if (matchFilter === "same" && userSubjectCategoryIds.length > 0) {
        subjectQuery = subjectQuery.where(
          "subject_category_id",
          "in",
          userSubjectCategoryIds,
        );
      } else if (
        matchFilter === "similar" &&
        userSubjectCategoryIds.length > 0
      ) {
        subjectQuery = subjectQuery.where((eb) =>
          eb.or([
            eb("subject_category_id", "is", null),
            eb("subject_category_id", "not in", userSubjectCategoryIds),
          ]),
        );
      }

      const allSubjects = await subjectQuery.execute();

      // Grouper subjects par org_id
      const subjectsByOrg = new Map<
        string,
        Array<{ id: string; subject_category_id: string | null | undefined }>
      >();
      allSubjects.forEach((s) => {
        if (!s.organization_id) return;
        if (!subjectsByOrg.has(s.organization_id))
          subjectsByOrg.set(s.organization_id, []);
        subjectsByOrg
          .get(s.organization_id)!
          .push({ id: s.id, subject_category_id: s.subject_category_id });
      });

      // ── 5. Construire les rows (une par org-subject pair) ─────────────────
      const rows: z.infer<typeof TargetRowSchema>[] = [];

      for (const org of orgs) {
        const subjects = subjectsByOrg.get(org.id) ?? [];

        // Calculer match_category de l'org
        const orgIndustryId = org.industry_id;
        const sameIndustry =
          !!orgIndustryId && userIndustryIds.includes(orgIndustryId);

        if (subjects.length > 0) {
          for (const subj of subjects) {
            const sameSubjCat =
              userSubjectCategoryIds.length > 0 &&
              !!subj.subject_category_id &&
              userSubjectCategoryIds.includes(subj.subject_category_id);
            const cat: "same" | "similar" | "different" = !sameIndustry
              ? "different"
              : sameSubjCat
                ? "same"
                : "similar";
            rows.push({
              ...org,
              subject_id: subj.id,
              subject_category_id: subj.subject_category_id ?? null,
              match_category: cat,
            });
          }
        }
      }

      return rows;
    }),
};
