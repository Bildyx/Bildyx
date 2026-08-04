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
import { OrganizationSubtypeEnum } from "../models/utils/enums.js";
import { z } from "zod";

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
        const isUuid = /^[0-9a-f-]{36}$/.test(id);
        const row = await database
          .selectFrom("organizations")
          .selectAll()
          .where(isUuid ? "id" : "slug", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "Organization not found",
          });
        }

        let template = "organizations/company-card";

        switch (row.subtype as z.infer<typeof OrganizationSubtypeEnum>) {
          case OrganizationSubtypeEnum.enum.COMPANY: {
            template = "organizations/company-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.GOVERNMENT: {
            const t1 = (row.type1 || "").toLowerCase().trim();
            const nm = (row.name || "").toLowerCase().trim();

            if (
              t1 === "upper house" ||
              t1 === "lower house" ||
              nm.includes("house of") ||
              nm.includes("senate")
            ) {
              template = "organizations/house-card";
            } else if (
              t1 === "the president administration" ||
              t1 === "vice president administration" ||
              nm.includes("president administration") ||
              nm.includes("vice president administration")
            ) {
              template = "organizations/president-administration-card";
            } else if (t1 === "agency" || nm.includes("agency")) {
              template = "organizations/agency-card";
            } else if (t1 === "bureau" || nm.includes("bureau")) {
              template = "organizations/bureau-card";
            } else if (
              t1 === "administration" ||
              nm.includes("administration")
            ) {
              template = "organizations/administration-card";
            } else if (
              t1 === "services" ||
              t1 === "service" ||
              nm.includes("services") ||
              nm.includes("service")
            ) {
              template = "organizations/services-card";
            } else if (t1 === "institute" || nm.includes("institute")) {
              template = "organizations/institute-card";
            } else if (t1 === "office" || nm.includes("office")) {
              template = "organizations/office-card";
            } else if (
              t1 === "laboratory" ||
              t1 === "laboratories" ||
              nm.includes("laboratory") ||
              nm.includes("laboratories")
            ) {
              template = "organizations/laboratories-card";
            } else if (
              t1 === "directorate" ||
              t1 === "directorates" ||
              nm.includes("directorate") ||
              nm.includes("directorates")
            ) {
              template = "organizations/directorates-card";
            } else if (
              t1 === "division" ||
              t1 === "divisions" ||
              nm.includes("division") ||
              nm.includes("divisions")
            ) {
              template = "organizations/divisions-card";
            } else if (
              t1 === "program" ||
              t1 === "programs" ||
              nm.includes("program") ||
              nm.includes("programs")
            ) {
              template = "organizations/programs-card";
            } else if (t1 === "task force" || nm.includes("task force")) {
              template = "organizations/task-force-card";
            } else if (t1 === "board" || nm.includes("board")) {
              template = "organizations/board-card";
            } else if (t1 === "commission" || nm.includes("commission")) {
              template = "organizations/commissions-card";
            } else if (t1 === "council" || nm.includes("council")) {
              template = "organizations/council-card";
            } else if (t1 === "committee" || nm.includes("committee")) {
              template = "organizations/committee-card";
            } else {
              template = "organizations/government-card";
            }
            break;
          }
          case OrganizationSubtypeEnum.enum.CENTRAL_BANK: {
            template = "organizations/central-bank-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.COURT: {
            template = "organizations/court-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.SOE: {
            template = "organizations/soe-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.LIBRARY: {
            template = "organizations/library-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.MUSEUM: {
            template = "organizations/museum-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.UNIVERSITY: {
            template = "organizations/university-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.RESEARCH_INSTITUTE: {
            template = "organizations/research-institute-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.THINK_TANK: {
            template = "organizations/think-tank-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.NGO: {
            template = "organizations/ngo-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.CLUB: {
            template = "organizations/club-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.SOCIETY: {
            template = "organizations/society-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.ASSOCIATION: {
            template = "organizations/association-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.STATE_GOVERNMENT: {
            template = "organizations/state-government-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.CITY_GOVERNMENT: {
            template = "organizations/city-government-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.HOSPITAL: {
            template = "organizations/hospital-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.NATIONAL_PARK: {
            template = "organizations/national-park-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.OMBUDSMAN: {
            template = "organizations/ombudsman-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.NATIONAL_AUDIT_OFFICE: {
            template = "organizations/national-audit-office-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.EMBASSY: {
            template = "organizations/embassy-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.CHAMBER_OF_COMMERCE: {
            template = "organizations/chamber-of-commerce-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.PUBLIC_PARKS: {
            template = "organizations/public-parks-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.PRIMARY_SCHOOLS:
          case OrganizationSubtypeEnum.enum.SECONDARY_SCHOOLS: {
            template = "organizations/school-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.ARMY: {
            template = "organizations/army-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.NON_PROFIT: {
            template = "organizations/non-profit-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.FOUNDATION: {
            template = "organizations/foundation-card";
            break;
          }
          case OrganizationSubtypeEnum.enum.INTERNATIONAL_ORGANIZATION: {
            template = "organizations/international-organization-card";
            break;
          }
        }
        return await sendHtmlResponse(
          ctx,
          await renderCardHtml(template, await mapOrganization(row)),
        );
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
