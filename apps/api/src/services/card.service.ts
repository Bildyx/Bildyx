import puppeteer, { type Browser, type Page } from "puppeteer";
import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

// Helper to load icons as Base64 data URIs for Puppeteer compatibility
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
    console.warn(`[getIconBase64] Icon not found for category "${category}", file "${filename}"`);
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
// Puppeteer singleton — launched once, reused for all requests
// ---------------------------------------------------------------------------

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.connected) {
    _browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }
  return _browser;
}

export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
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

// ---------------------------------------------------------------------------
// Render an HTML string to a PNG buffer using Puppeteer
// ---------------------------------------------------------------------------

export async function renderCardPng(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  let page: Page | null = null;
  try {
    page = await browser.newPage();

    // Disable cache so fonts/images load fresh each time
    await page.setCacheEnabled(false);

    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    // Measure the rendered card dimensions
    const dimensions = await page.evaluate(() => {
      const el = document.querySelector(".main-card") as HTMLElement | null;
      if (!el) return { width: 500, height: 600 };
      const rect = el.getBoundingClientRect();
      return { width: Math.ceil(rect.width), height: Math.ceil(rect.height) };
    });

    await page.setViewport({
      width: dimensions.width + 4,
      height: dimensions.height + 4,
      deviceScaleFactor: 2, // 2x resolution for crisp output
    });

    // Re-set content after viewport change so layout is correct
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: dimensions.width + 4,
        height: dimensions.height + 4,
      },
      omitBackground: true,
    });

    return Buffer.from(screenshot);
  } finally {
    await page?.close();
  }
}

// ---------------------------------------------------------------------------
// High-level helper: template → PNG in one call
// ---------------------------------------------------------------------------

export async function generateCard(
  templateName: string,
  data: Record<string, unknown>,
): Promise<Buffer> {
  const html = await renderCardHtml(templateName, data);
  return renderCardPng(html);
}
