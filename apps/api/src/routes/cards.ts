import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC.js";
import { database } from "../database.js";
import { renderCardHtml } from "../services/card.service.js";
import {
  mapCountry,
  mapCity,
  mapJob,
  mapOrganization,
  mapSkill,
  mapIndustry,
  mapCertification,
  mapSubject,
  mapDegree,
} from "../services/cards/mappers.js";
import { CardInputSchema } from "../models/card.js";
import type { Request, Response } from "express";

// ---------------------------------------------------------------------------
// O(1) template resolution for organization subtypes
// ---------------------------------------------------------------------------

const SUBTYPE_TEMPLATE_MAP: Record<string, string> = {
  COMPANY: "organizations/company-card",
  CENTRAL_BANK: "organizations/central-bank-card",
  COURT: "organizations/court-card",
  SOE: "organizations/soe-card",
  LIBRARY: "organizations/library-card",
  MUSEUM: "organizations/museum-card",
  UNIVERSITY: "organizations/university-card",
  RESEARCH_INSTITUTE: "organizations/research-institute-card",
  THINK_TANK: "organizations/think-tank-card",
  NGO: "organizations/ngo-card",
  CLUB: "organizations/club-card",
  SOCIETY: "organizations/society-card",
  ASSOCIATION: "organizations/association-card",
  STATE_GOVERNMENT: "organizations/state-government-card",
  CITY_GOVERNMENT: "organizations/city-government-card",
  HOSPITAL: "organizations/hospital-card",
  NATIONAL_PARK: "organizations/national-park-card",
  OMBUDSMAN: "organizations/ombudsman-card",
  NATIONAL_AUDIT_OFFICE: "organizations/national-audit-office-card",
  EMBASSY: "organizations/embassy-card",
  CHAMBER_OF_COMMERCE: "organizations/chamber-of-commerce-card",
  PUBLIC_PARKS: "organizations/public-parks-card",
  PRIMARY_SCHOOLS: "organizations/school-card",
  SECONDARY_SCHOOLS: "organizations/school-card",
  ARMY: "organizations/army-card",
  NON_PROFIT: "organizations/non-profit-card",
  FOUNDATION: "organizations/foundation-card",
  INTERNATIONAL_ORGANIZATION: "organizations/international-organization-card",
  PUBLIC_COMPANY: "organizations/company-card",
  OTHER: "organizations/company-card",
};

/** Ordered rules for GOVERNMENT sub-dispatch (type1 / name matching). */
const GOVERNMENT_RULES: Array<{
  keywords: string[];
  template: string;
}> = [
  { keywords: ["upper house", "lower house", "house of", "senate"], template: "organizations/house-card" },
  { keywords: ["president administration", "vice president administration"], template: "organizations/president-administration-card" },
  { keywords: ["agency"], template: "organizations/agency-card" },
  { keywords: ["bureau"], template: "organizations/bureau-card" },
  { keywords: ["administration"], template: "organizations/administration-card" },
  { keywords: ["services", "service"], template: "organizations/services-card" },
  { keywords: ["institute"], template: "organizations/institute-card" },
  { keywords: ["office"], template: "organizations/office-card" },
  { keywords: ["laboratory", "laboratories"], template: "organizations/laboratories-card" },
  { keywords: ["directorate", "directorates"], template: "organizations/directorates-card" },
  { keywords: ["division", "divisions"], template: "organizations/divisions-card" },
  { keywords: ["program", "programs"], template: "organizations/programs-card" },
  { keywords: ["task force"], template: "organizations/task-force-card" },
  { keywords: ["board"], template: "organizations/board-card" },
  { keywords: ["commission"], template: "organizations/commissions-card" },
  { keywords: ["council"], template: "organizations/council-card" },
  { keywords: ["committee"], template: "organizations/committee-card" },
];

function resolveOrganizationTemplate(row: Record<string, any>): string {
  const subtype = (row.subtype || "").toUpperCase().trim();

  // Fast path: direct O(1) lookup for non-GOVERNMENT subtypes
  if (subtype !== "GOVERNMENT") {
    return SUBTYPE_TEMPLATE_MAP[subtype] || "organizations/company-card";
  }

  // GOVERNMENT sub-dispatch: check type1 and name against ordered rules
  const t1 = (row.type1 || "").toLowerCase().trim();
  const nm = (row.name || "").toLowerCase().trim();

  for (const rule of GOVERNMENT_RULES) {
    for (const kw of rule.keywords) {
      if (t1 === kw || t1.includes(kw) || nm.includes(kw)) {
        return rule.template;
      }
    }
  }

  return "organizations/government-card";
}

interface CardsContext {
  req?: Request;
  res?: Response;
}

async function sendHtmlResponse(ctx: CardsContext, html: string): Promise<any> {
  const isRpc =
    ctx.req?.path?.startsWith("/rpc") || ctx.req?.url?.includes("/rpc");
  if (isRpc) {
    return html;
  }
  if (!ctx.res) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Express response context missing",
    });
  }
  ctx.res.setHeader("Content-Type", "text/html; charset=utf-8");
  ctx.res.send(html);
}

export const cards = {
  getCountry: publicProcedure
    .route({
      method: "GET",
      summary: "Generate country card HTML",
      path: "/cards/country/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id, extended } = input;
      const isExtended = extended === "true";
      try {
        const row = await database
          .selectFrom("countries")
          .selectAll()
          .where("iso_code", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Country not found",
          });
        }
        const mappedData = await mapCountry(row);
        const html = await renderCardHtml("country-card", {
          ...mappedData,
          extended: isExtended,
        });
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating country card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getCity: publicProcedure
    .route({
      method: "GET",
      summary: "Generate city card HTML",
      path: "/cards/city/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("cities")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "City not found",
          });
        }
        const mappedData = await mapCity(row);
        const html = await renderCardHtml("city-card", mappedData);
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(`[cards] Error generating city card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getJob: publicProcedure
    .route({
      method: "GET",
      summary: "Generate job card HTML",
      path: "/cards/job/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("jobs")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Job not found",
          });
        }
        const html = await renderCardHtml("job-card", mapJob(row));
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(`[cards] Error generating job card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getOrganization: publicProcedure
    .route({
      method: "GET",
      summary: "Generate organization card HTML",
      path: "/cards/organization/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const t0 = performance.now();
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("organizations")
          .select([
            "id",
            "name",
            "slug",
            "serial_number",
            "subtype",
            "type1",
            "type2",
            "description",
            "mission",
            "authority",
            "ownership",
            "jurisdiction",
            "known_for",
            "budget",
            "founded",
            "founders",
            "collections",
            "student_count",
            "undergraduates",
            "postgraduates",
            "members",
            "personnel",
            "numberOfEmployees",
            "parent_organization_id",
            "city_id",
            "research_areas",
            "products",
            "services",
            "facilities",
            "programs_activities",
          ])
          .where(isUuid ? "id" : "slug", "=", id)
          .executeTakeFirst();
        const t1 = performance.now();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Organization not found",
          });
        }

        const template = resolveOrganizationTemplate(row);

        // Set cache headers
        ctx.res.setHeader("Cache-Control", "public, max-age=300");

        const mapped = await mapOrganization(row);
        const t2 = performance.now();
        const html = await renderCardHtml(template, mapped);
        const t3 = performance.now();

        console.log(
          `[cards/organization] id=${id} | DB: ${(t1 - t0).toFixed(0)}ms | map: ${(t2 - t1).toFixed(0)}ms | render: ${(t3 - t2).toFixed(0)}ms | total: ${(t3 - t0).toFixed(0)}ms`,
        );

        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating organization card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getSkill: publicProcedure
    .route({
      method: "GET",
      summary: "Generate skill card HTML",
      path: "/cards/skill/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("skills")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Skill not found",
          });
        }
        const html = await renderCardHtml("skill-card", mapSkill(row));
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(`[cards] Error generating skill card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getIndustry: publicProcedure
    .route({
      method: "GET",
      summary: "Generate industry card HTML",
      path: "/cards/industry/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("industries")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Industry not found",
          });
        }
        const html = await renderCardHtml("industry-card", mapIndustry(row));
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating industry card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getCertification: publicProcedure
    .route({
      method: "GET",
      summary: "Generate certification card HTML",
      path: "/cards/certification/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("certifications")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Certification not found",
          });
        }
        let issuingOrgName: string | undefined;
        if (row.issuing_organization_id) {
          const org = await database
            .selectFrom("organizations")
            .select("name")
            .where("id", "=", row.issuing_organization_id)
            .executeTakeFirst();
          issuingOrgName = org?.name;
        }
        const html = await renderCardHtml(
          "certification-card",
          mapCertification(row, issuingOrgName),
        );
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating certification card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getProduct: publicProcedure
    .route({
      method: "GET",
      summary: "Generate product card HTML",
      path: "/cards/product/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("subjects")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Product not found",
          });
        }

        let organizationName: string | undefined;
        if (row.organization_id) {
          const org = await database
            .selectFrom("organizations")
            .select("name")
            .where("id", "=", row.organization_id)
            .executeTakeFirst();
          organizationName = org?.name;
        }

        const industries = await database
          .selectFrom("industries")
          .innerJoin(
            "_ProductIndustries",
            "_ProductIndustries.B",
            "industries.id",
          )
          .select("industries.name")
          .where("_ProductIndustries.A", "=", row.id)
          .execute();
        const industriesStr = industries.map((ind) => ind.name).join(", ");

        const html = await renderCardHtml(
          "product-card",
          mapSubject(row, organizationName, industriesStr),
        );
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating product card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getSubject: publicProcedure
    .route({
      method: "GET",
      summary: "Generate subject card HTML",
      path: "/cards/subject/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("subjects")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Subject not found",
          });
        }

        let organizationName: string | undefined;
        if (row.organization_id) {
          const org = await database
            .selectFrom("organizations")
            .select("name")
            .where("id", "=", row.organization_id)
            .executeTakeFirst();
          organizationName = org?.name;
        }

        const industries = await database
          .selectFrom("industries")
          .innerJoin(
            "_ProductIndustries",
            "_ProductIndustries.B",
            "industries.id",
          )
          .select("industries.name")
          .where("_ProductIndustries.A", "=", row.id)
          .execute();
        const industriesStr = industries.map((ind) => ind.name).join(", ");

        const html = await renderCardHtml(
          "product-card",
          mapSubject(row, organizationName, industriesStr),
        );
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating subject card for '${id}':`,
          err,
        );
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),

  getDegree: publicProcedure
    .route({
      method: "GET",
      summary: "Generate degree card HTML",
      path: "/cards/degree/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as CardsContext;
      if (!ctx.req || !ctx.res) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Express request/response context missing",
        });
      }
      const { id } = input;
      try {
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("degrees")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Degree not found",
          });
        }
        const html = await renderCardHtml("degree-card", mapDegree(row));
        return await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(`[cards] Error generating degree card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message || "Internal server error",
        });
      }
    }),
};
