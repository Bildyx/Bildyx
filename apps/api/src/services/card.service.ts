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
  return ejs.renderFile(
    templatePath,
    {
      ...data,
      getIcon: getIconBase64,
    },
    { async: true },
  );
}
