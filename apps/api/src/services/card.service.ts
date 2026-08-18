import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { VITE_API_URL } from "../configuration.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

// ---------------------------------------------------------------------------
// Icon URL helper — returns an absolute URL pointing to the API server
// ---------------------------------------------------------------------------

export function getIconUrl(category: string, filename: string): string {
  return `${VITE_API_URL}/static/icons/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`;
}

/**
 * @deprecated Use getIconUrl() instead. Kept temporarily for backward compat.
 */
export function getIconBase64(category: string, filename: string): string {
  return getIconUrl(category, filename);
}

// ---------------------------------------------------------------------------
// Pre-built reverse lookup: label → icon name (O(1) instead of O(n) per row)
// ---------------------------------------------------------------------------

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

// Build reverse map: label → icon name
const labelToIconMap = new Map<string, string>();
for (const [icon, labels] of Object.entries(iconToLabelsMap)) {
  for (const label of labels) {
    // First icon wins (preserves original priority)
    if (!labelToIconMap.has(label)) {
      labelToIconMap.set(label, icon);
    }
  }
}

// ---------------------------------------------------------------------------
// Cached organization CSS (read once at startup)
// ---------------------------------------------------------------------------

const cssPath = path.join(
  TEMPLATES_DIR,
  "organizations",
  "organization-card.css",
);
const organizationCss = fs.existsSync(cssPath)
  ? fs.readFileSync(cssPath, "utf-8")
  : "";

// ---------------------------------------------------------------------------
// EJS template cache (compiled once, reused on every request)
// ---------------------------------------------------------------------------

const templateCache = new Map<string, ejs.AsyncTemplateFunction>();

function getCompiledTemplate(templateName: string): ejs.AsyncTemplateFunction {
  const cached = templateCache.get(templateName);
  if (cached) return cached;

  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
  const templateStr = fs.readFileSync(templatePath, "utf-8");
  const compiled = ejs.compile(templateStr, {
    async: true,
    filename: templatePath,
  }) as ejs.AsyncTemplateFunction;
  templateCache.set(templateName, compiled);
  return compiled;
}

// ---------------------------------------------------------------------------
// Render an EJS template to HTML
// ---------------------------------------------------------------------------

export async function renderCardHtml(
  templateName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const renderRow = (
    label: string,
    value: unknown,
    customIcon?: string,
  ): string => {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value) && value.length === 0) return "";

    const cleanLabel = label.toLowerCase().trim();
    const iconName = customIcon || labelToIconMap.get(cleanLabel) || "notes";

    const isLongText =
      Array.isArray(value) ||
      (typeof value === "string" &&
        (value.length > 45 || value.includes("\n")));
    const iconUrl = getIconUrl("icons", `${iconName}.png`);
    const valStr = Array.isArray(value) ? value.join(", ") : String(value);

    return `
            <div class="info-row">
                <div class="info-icon"><img src="${iconUrl}" alt="" /></div>
                <div class="info-label">${label}</div>
                <div class="info-value"${isLongText ? "" : ' style="padding-top: 8px;"'}>${valStr}</div>
            </div>`;
  };

  const renderHeader = (title: string): string => {
    const logoUrl = getIconUrl("logos", "Logo-MayGraph_Big1.png");
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

  const compiledTemplate = getCompiledTemplate(templateName);

  const html = await compiledTemplate({
    ...data,
    getIcon: getIconUrl,
    renderRow,
    renderHeader,
    renderFooter,
    organizationCss,
  });

  if (organizationCss) {
    return html.replace(
      /<link rel="stylesheet" href="\/css\/organization-card\.css">/g,
      `<style>${organizationCss}</style>`,
    );
  }

  return html;
}
