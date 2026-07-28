import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC.js";
import { database } from "../database.js";
import { renderCardHtml } from "../services/card.service.js";
import {
  mapCountry,
  mapCity,
  mapJob,
  mapOrganization,
  mapUniversity,
  mapSkill,
  mapIndustry,
  mapCertification,
  mapSubject,
} from "../services/cards/mappers.js";
import { CardInputSchema } from "../models/card.js";
import type { Request, Response } from "express";
import { OrganizationSubtypeEnum } from "../models/utils/enums.js";
import { z } from "zod";

interface CardsContext {
  req?: Request;
  res?: Response;
}

async function sendHtmlResponse(
  ctx: CardsContext,
  html: string,
): Promise<void> {
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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

        let template = "company-card";

        switch (row.subtype as z.infer<typeof OrganizationSubtypeEnum>) {
          case OrganizationSubtypeEnum.enum.GOVERNMENT: {
            template = "government-card";
            break;
          }
        }
        await sendHtmlResponse(
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

  getUniversity: publicProcedure
    .route({
      method: "GET",
      summary: "Generate university card HTML",
      path: "/cards/university/{id}",
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
          .selectFrom("universities")
          .selectAll()
          .where(isUuid ? "id" : "serial_number", "=", id)
          .executeTakeFirst();
        if (!row) {
          throw new ORPCError("NOT_FOUND", {
            message: "University not found",
          });
        }
        const html = await renderCardHtml(
          "university-card",
          mapUniversity(row),
        );
        await sendHtmlResponse(ctx, html);
      } catch (err) {
        const error = err as Error;
        console.error(
          `[cards] Error generating university card for '${id}':`,
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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
        await sendHtmlResponse(ctx, html);
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
};
