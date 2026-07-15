import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC.js";
import { z } from "zod";
import { database } from "../database.js";
import { generateCard } from "../services/card.service.js";
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

const VALID_TYPES = [
  "country",
  "city",
  "job",
  "company",
  "university",
  "skill",
  "industry",
  "certification",
  "product",
  "subject",
] as const;

const CardInputSchema = z.object({
  id: z.string(),
  extended: z.string().optional(),
});

async function sendPngResponse(ctx: any, png: Buffer) {
  ctx.res.setHeader("Content-Type", "image/png");
  ctx.res.setHeader("Content-Length", png.length);
  ctx.res.send(png);
}

export const cards = {
  getCountry: publicProcedure
    .route({
      method: "GET",
      summary: "Generate country card image",
      path: "/cards/country/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Country not found" });
          return;
        }
        const png = await generateCard("country-card", {
          ...mapCountry(row as any),
          extended: isExtended,
        });
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating country card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getCity: publicProcedure
    .route({
      method: "GET",
      summary: "Generate city card image",
      path: "/cards/city/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "City not found" });
          return;
        }
        const png = await generateCard("city-card", mapCity(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating city card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getJob: publicProcedure
    .route({
      method: "GET",
      summary: "Generate job card image",
      path: "/cards/job/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Job not found" });
          return;
        }
        const png = await generateCard("job-card", mapJob(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating job card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getCompany: publicProcedure
    .route({
      method: "GET",
      summary: "Generate company card image",
      path: "/cards/company/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Organization not found" });
          return;
        }
        const png = await generateCard("company-card", mapOrganization(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating company card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getUniversity: publicProcedure
    .route({
      method: "GET",
      summary: "Generate university card image",
      path: "/cards/university/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "University not found" });
          return;
        }
        const png = await generateCard("university-card", mapUniversity(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating university card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getSkill: publicProcedure
    .route({
      method: "GET",
      summary: "Generate skill card image",
      path: "/cards/skill/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Skill not found" });
          return;
        }
        const png = await generateCard("skill-card", mapSkill(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating skill card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getIndustry: publicProcedure
    .route({
      method: "GET",
      summary: "Generate industry card image",
      path: "/cards/industry/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Industry not found" });
          return;
        }
        const png = await generateCard("industry-card", mapIndustry(row as any));
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating industry card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getCertification: publicProcedure
    .route({
      method: "GET",
      summary: "Generate certification card image",
      path: "/cards/certification/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Certification not found" });
          return;
        }
        let issuingOrgName: string | undefined;
        if ((row as any).issuing_organization_id) {
          const org = await database
            .selectFrom("organizations")
            .select("name")
            .where("id", "=", (row as any).issuing_organization_id)
            .executeTakeFirst();
          issuingOrgName = org?.name;
        }
        const png = await generateCard(
          "certification-card",
          mapCertification(row as any, issuingOrgName),
        );
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating certification card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getProduct: publicProcedure
    .route({
      method: "GET",
      summary: "Generate product card image",
      path: "/cards/product/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Product not found" });
          return;
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
          .innerJoin("_ProductIndustries", "_ProductIndustries.B", "industries.id")
          .select("industries.name")
          .where("_ProductIndustries.A", "=", row.id)
          .execute();
        const industriesStr = industries.map((ind) => ind.name).join(", ");

        const png = await generateCard(
          "product-card",
          mapSubject(row as any, organizationName, industriesStr),
        );
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating product card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  getSubject: publicProcedure
    .route({
      method: "GET",
      summary: "Generate subject card image",
      path: "/cards/subject/{id}",
      tags: ["Cards"],
    })
    .input(CardInputSchema)
    .handler(async ({ input, context }) => {
      const ctx = context as any;
      if (!ctx?.req || !ctx?.res) {
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
          ctx.res.status(404).json({ error: "Subject not found" });
          return;
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
          .innerJoin("_ProductIndustries", "_ProductIndustries.B", "industries.id")
          .select("industries.name")
          .where("_ProductIndustries.A", "=", row.id)
          .execute();
        const industriesStr = industries.map((ind) => ind.name).join(", ");

        const png = await generateCard(
          "product-card",
          mapSubject(row as any, organizationName, industriesStr),
        );
        await sendPngResponse(ctx, png);
      } catch (err: any) {
        console.error(`[cards] Error generating subject card for '${id}':`, err);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: err?.message ?? "Internal server error",
        });
      }
    }),

  listCardTypes: publicProcedure
    .route({
      method: "GET",
      summary: "List available card types and metadata",
      path: "/cards",
      tags: ["Cards"],
    })
    .handler(async () => {
      return {
        description: "Bildyx Card Generation API",
        usage: "GET /api/cards/{type}/{id}  —  returns a PNG image",
        types: VALID_TYPES,
        params: {
          id: "UUID or serial_number (or slug for company)",
          extended:
            "boolean (string) — country cards only, adds economic section (default: false)",
        },
        examples: [
          "GET /api/cards/country/AE",
          "GET /api/cards/country/AE?extended=true",
          "GET /api/cards/city/DXB-001",
          "GET /api/cards/job/job-001",
          "GET /api/cards/company/microsoft",
          "GET /api/cards/university/univ-001",
          "GET /api/cards/skill/skill-001",
          "GET /api/cards/industry/ind-001",
          "GET /api/cards/certification/cert-001",
        ],
      };
    }),
};
