import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

// Helper to load icons as Base64 data URIs for templates
export function getIconBase64(category: string, filename: string): string {
  const possiblePaths = [
    path.resolve(process.cwd(), "../../Files/icons", category, filename),
    path.resolve(process.cwd(), "Files/icons", category, filename),
    path.resolve(__dirname, "../../../../Files/icons", category, filename),
  ];

  let resolvedPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      resolvedPath = p;
      break;
    }
  }

  if (!resolvedPath) {
    console.warn(
      `[getIconBase64] Icon not found for category "${category}", file "${filename}"`,
    );
    return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  }

  const content = fs.readFileSync(resolvedPath);
  const ext = path.extname(filename).toLowerCase();
  let mime = "image/png";
  if (ext === ".svg") mime = "image/svg+xml";
  else if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
  else if (ext === ".gif") mime = "image/gif";

  return `data:${mime};base64,${content.toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Render an EJS template to HTML
// ---------------------------------------------------------------------------

export async function renderCardHtml(
  templateName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);

  const renderRow = (
    label: string,
    value: unknown,
    customIcon?: string,
  ): string => {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value) && value.length === 0) return "";

    const iconToLabelsMap: Record<string, string[]> = {
      notes: [
        "description",
        "focus",
        "dissolution/status",
        "known for",
        "known for/impact",
        "ecosystems",
        "mission",
      ],
      Type: ["type", "type 1", "type 2"],
      monument: ["established", "founded", "ownership", "formed"],
      hq: ["headquarters", "branches/chapters", "county seat", "city"],
      location: ["location"],
      capital: ["capital"],
      parent_company: ["parent", "administering agency", "part of"],
      offices: ["offices"],
      employees: [
        "employees",
        "staff",
        "researchers",
        "judges",
        "personnel",
        "scientists",
        "teachers",
      ],
      product: ["products", "research output", "services"],
      Subsidiaries: [
        "subsidiaries",
        "subordinate bodies",
        "subordinate offices/divisions",
        "regional/field offices",
        "ministries/departments",
        "departments",
        "departments/divisions",
        "departments overseen",
        "child agencies",
      ],
      government: ["child agencies", "subordinate units/branches"],
      currency: ["budget", "budget authority", "funding sources"],
      globe: [
        "jurisdiction",
        "country",
        "scope",
        "state",
        "state/province/prefecture",
        "sending country",
        "host country",
        "area size",
        "region served",
      ],
      authority: ["appointing authority"],
      group: ["target population", "partners", "population"],
      brain: ["research areas"],
      tasks: [
        "programs/centers",
        "programs/initiatives",
        "programs/activities",
        "programs/activities (main)",
        "activities/programs",
        "functions/programs",
        "infrastructure managed",
        "types of audits",
      ],
      life_quality: ["functions/programs"],
      certified_person: ["members", "visitors", "students"],
      mortarboard: ["education level"],
    };

    const cleanLabel = label.toLowerCase().trim();
    let iconName = customIcon;
    if (!iconName) {
      for (const [icon, labels] of Object.entries(iconToLabelsMap)) {
        if (labels.includes(cleanLabel)) {
          iconName = icon;
          break;
        }
      }
    }
    if (!iconName) iconName = "notes";

    const isLongText =
      Array.isArray(value) ||
      (typeof value === "string" &&
        (value.length > 45 || value.includes("\n")));
    const iconUrl = getIconBase64("icons", `${iconName}.png`);
    const valStr = Array.isArray(value) ? value.join(", ") : String(value);

    return `
            <div class="info-row">
                <div class="info-icon"><img src="${iconUrl}" alt="" /></div>
                <div class="info-label">${label}</div>
                <div class="info-value"${isLongText ? "" : ' style="padding-top: 8px;"'}>${valStr}</div>
            </div>`;
  };

  const renderHeader = (title: string): string => {
    const logoUrl = getIconBase64("logos", "Logo-MayGraph_Big1.png");
    return `
        <div class="header-row">
            <div class="maygraph-logo">
                <img src="${logoUrl}" alt="MayGraph" />
            </div>
            <div class="company-title">${title}</div>
        </div>`;
  };

  const renderFooter = (): string => {
    const serialNumber = data.serial_number || "";
    const yearStr = data.year || new Date().getFullYear();
    return `
        <div class="footer-row">
            <span class="serial-number">#${serialNumber}</span>
            <span class="copyright">©${yearStr}</span>
        </div>`;
  };

  const cssPath = path.join(
    TEMPLATES_DIR,
    "organizations",
    "organization-card.css",
  );
  const organizationCss = fs.existsSync(cssPath)
    ? fs.readFileSync(cssPath, "utf-8")
    : "";

  const html = await ejs.renderFile(
    templatePath,
    {
      ...data,
      getIcon: getIconBase64,
      renderRow,
      renderHeader,
      renderFooter,
      organizationCss,
    },
    { async: true },
  );

  if (organizationCss) {
    return html.replace(
      /<link rel="stylesheet" href="\/css\/organization-card\.css">/g,
      `<style>${organizationCss}</style>`
    );
  }

  return html;
}
