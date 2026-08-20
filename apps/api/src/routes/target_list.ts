import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { z } from "zod";
import { OrganizationSchema } from "../models/organizations";
import { zNullableUUID } from "../models/utils/preprocessors";
import {
  OrganizationSubtypeEnum,
  EmployeeCountRangeEnum,
} from "../models/utils/enums";
import { GetTargetListSchema, TargetRowSchema } from "../models/target_list";

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
        keyword,
      } = input;

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

      let orgQuery = database
        .selectFrom("organizations")
        .leftJoin("cities", "cities.id", "organizations.city_id")
        .leftJoin("countries", "countries.iso_code", "cities.country_id")
        .selectAll("organizations");

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
      if (keyword) {
        orgQuery = orgQuery.where((eb) =>
          eb.or([
            eb("organizations.name", "ilike", `%${keyword.trim()}%`),
            eb("organizations.description", "ilike", `%${keyword.trim()}%`),
          ]),
        );
      }

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

      let subjectQuery = database
        .selectFrom("subjects")
        .select([
          "id",
          "organization_id",
          "subject_category_id",
          "name",
          "description",
          "logo_url",
        ])
        .where("organization_id", "in", orgIds);

      if (expSubjectIds.length > 0) {
        subjectQuery = subjectQuery.where("id", "not in", expSubjectIds);
      }

      if (subject_category_id) {
        subjectQuery = subjectQuery.where(
          "subject_category_id",
          "=",
          subject_category_id,
        );
      }

      const allSubjects = await subjectQuery.execute();

      const subjectsByOrg = new Map<
        string,
        Array<{
          id: string;
          subject_category_id: string | null | undefined;
          name: string;
          description: string | null | undefined;
          logo_url: string | null | undefined;
        }>
      >();

      allSubjects.forEach((s) => {
        if (!s.organization_id) return;
        if (!subjectsByOrg.has(s.organization_id))
          subjectsByOrg.set(s.organization_id, []);
        subjectsByOrg.get(s.organization_id)!.push({
          id: s.id,
          subject_category_id: s.subject_category_id,
          name: s.name,
          description: s.description,
          logo_url: s.logo_url,
        });
      });

      const rows: z.infer<typeof TargetRowSchema>[] = [];

      for (const org of orgs) {
        const subjects = subjectsByOrg.get(org.id) ?? [];

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
              subject_name: subj.name,
              subject_description: subj.description ?? null,
              subject_logo_url: subj.logo_url ?? null,
              match_category: cat,
            });
          }
        }
      }

      const filteredRows = matchFilter
        ? rows.filter((r) => r.match_category === matchFilter)
        : rows;

      return filteredRows;
    }),
};
