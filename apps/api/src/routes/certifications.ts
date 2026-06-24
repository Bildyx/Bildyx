import { ORPCError } from "@orpc/server";
import { publicProcedure } from "../oRPC";
import { database } from "../database";
import { 
  GetCertificationsSchema, 
  CertificationSchema, 
  PostCertificationSchema 
} from "../models/certifications";
import { z } from "zod";

export const certifications = {
  // 1. Récupérer toutes les certifications d'une entreprise
  getByCompany: publicProcedure
    .route({ 
      method: "GET", 
      summary: "List all certifications",
      description: "Get all certifications by company with optional filters",
      path: "/companies/{companyId}/certifications", 
      tags: ["Certification"] 
    })
    .input(GetCertificationsSchema)
    .output(z.array(CertificationSchema))
    .handler(async ({ input }) => {
      const { companyId, search, category } = input;

      const company = await database.selectFrom('companies')
        .where('id', '=', companyId)
        .select('id')
        .executeTakeFirst();

      if (!company) {
        throw new ORPCError("NOT_FOUND", { message: "Company not found" });
      }

      // On sélectionne uniquement les vraies colonnes brutes connues par Kysely
      let query = database
        .selectFrom('certifications')
        .selectAll('certifications');

      if (search) {
        const p = `%${search.trim()}%`;
        query = query.where((eb) => 
          eb('name', 'ilike', p)
            .or('description', 'ilike', p)
        );
      }

      const certificationsData = await query
        .orderBy('created_at', 'desc')
        .execute();

      // Filtrage et mapping applicatif en pur TypeScript (Zéro erreur Kysely)
      const formattedData = certificationsData.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        description: cert.description ?? "",
        level: cert.level ?? "N/A",
        serialNumber: cert.serial_number ?? "",
        issuingOrganizationId: cert.issued_by ?? "", 
        category: cert.category ?? "OTHER",
        products: Array.isArray(cert.products) ? cert.products : [],
        jobs: Array.isArray(cert.jobs) ? cert.jobs : [],
        validityDurationMonths: Number(cert.validity_duration_months ?? 0),
        cost: Number(cert.cost ?? 0),
        costCurrency: cert.cost_currency ?? "EUR",
        websiteUrl: cert.website_url ?? "",
        logoUrl: cert.logo_url ?? "",
        metadata: typeof cert.metadata === 'string' ? JSON.parse(cert.metadata) : (cert.metadata || {}),
        deletedAt: cert.deleted_at ? new Date(cert.deleted_at) : null,
        createdAt: new Date(cert.created_at),
        updatedAt: new Date(cert.updated_at)
      }));

      // Application optionnelle du filtre category après récupération si la colonne pose souci
      if (category) {
        return formattedData.filter(c => c.category === category);
      }

      return formattedData;
    }),

  // 2. Récupérer une seule certification par son ID
  getOne: publicProcedure
    .route({ 
      method: "GET", 
      summary: "Get one certification",
      description: "Get a specific certification by its unique ID",
      path: "/certifications/{certificationId}", 
      tags: ["Certification"] 
    })
    .input(z.object({ certificationId: z.string().uuid() }))
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      const { certificationId } = input;

      const cert: any = await database
        .selectFrom('certifications')
        .selectAll('certifications')
        .where('id', '=', certificationId)
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("NOT_FOUND", { message: "Certification not found" });
      }

      return {
        id: cert.id,
        name: cert.name,
        description: cert.description ?? "",
        level: cert.level ?? "N/A",
        serialNumber: cert.serial_number ?? "",
        issuingOrganizationId: cert.issued_by ?? "",
        category: cert.category ?? "OTHER",
        products: Array.isArray(cert.products) ? cert.products : [],
        jobs: Array.isArray(cert.jobs) ? cert.jobs : [],
        validityDurationMonths: Number(cert.validity_duration_months ?? 0),
        cost: Number(cert.cost ?? 0),
        costCurrency: cert.cost_currency ?? "EUR",
        websiteUrl: cert.website_url ?? "",
        logoUrl: cert.logo_url ?? "",
        metadata: typeof cert.metadata === 'string' ? JSON.parse(cert.metadata) : (cert.metadata || {}),
        deletedAt: cert.deleted_at ? new Date(cert.deleted_at) : null,
        createdAt: new Date(cert.created_at),
        updatedAt: new Date(cert.updated_at)
      };
    }),

  // 3. Créer une nouvelle certification
  create: publicProcedure
    .route({
      method: "POST", 
      summary: "Create a new certification",
      description: "Create a new certification entry",
      path: "/certifications", 
      tags: ["Certification"] 
    })
    .input(PostCertificationSchema)
    .output(CertificationSchema)
    .handler(async ({ input }) => {
      
      // Insertion en mappant l'input camelCase vers les colonnes snake_case de votre BDD
      const valuesToInsert: any = {
        name: input.name,
        description: input.description,
        level: input.level,
        serial_number: input.serialNumber,
        issued_by: input.issuingOrganizationId,
        cost: input.cost,
        cost_currency: input.costCurrency,
        website_url: input.websiteUrl,
        logo_url: input.logoUrl,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      };

      // N'ajoute les colonnes de tableaux ou enums que si elles existent
      if ('category' in input) valuesToInsert.category = input.category;
      if ('products' in input) valuesToInsert.products = JSON.stringify(input.products);
      if ('jobs' in input) valuesToInsert.jobs = JSON.stringify(input.jobs);
      if ('validityDurationMonths' in input) valuesToInsert.validity_duration_months = input.validityDurationMonths;

      const cert: any = await database
        .insertInto('certifications')
        .values(valuesToInsert)
        .returningAll()
        .executeTakeFirst();

      if (!cert) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create certification" });
      }

      return {
        id: cert.id,
        name: cert.name,
        description: cert.description ?? "",
        level: cert.level ?? "N/A",
        serialNumber: cert.serial_number ?? "",
        issuingOrganizationId: cert.issued_by ?? "",
        category: cert.category ?? "OTHER",
        products: Array.isArray(cert.products) ? cert.products : [],
        jobs: Array.isArray(cert.jobs) ? cert.jobs : [],
        validityDurationMonths: Number(cert.validity_duration_months ?? 0),
        cost: Number(cert.cost ?? 0),
        costCurrency: cert.cost_currency ?? "EUR",
        websiteUrl: cert.website_url ?? "",
        logoUrl: cert.logo_url ?? "",
        metadata: typeof cert.metadata === 'string' ? JSON.parse(cert.metadata) : (cert.metadata || {}),
        deletedAt: cert.deleted_at ? new Date(cert.deleted_at) : null,
        createdAt: new Date(cert.created_at),
        updatedAt: new Date(cert.updated_at)
      };
    }),
};