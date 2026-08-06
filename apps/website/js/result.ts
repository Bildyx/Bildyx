/**
 * Pixel-perfect PDF generator for personality test results.
 *
 * Replaces the manual jsPDF vector-drawing approach with a real HTML/CSS
 * layout that is rasterized page-by-page (html2canvas) and assembled into
 * an A4 PDF (jsPDF). This lets us reproduce shadows, rounded cards,
 * gradients, a real curved-label donut chart, and real word clouds —
 * none of which are practical to hand-draw with jsPDF primitives.
 *
 * External libs required (load once, e.g. in your page's <head>, same way
 * you already load jspdf):
 *   https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
 *   (jspdf is already loaded in your project as `jspdf`)
 *
 * Word clouds are rendered with a small dependency-free spiral-placement
 * algorithm (see renderWordCloudDataUrl below) — no wordcloud2.js needed,
 * and its runtime is hard-bounded so it can never hang the page.
 */

import { PersonalityService } from "../services/personality.service";
import { getSession } from "./helpers";

declare var jspdf: any;
declare var html2canvas: any;

// ---------------------------------------------------------------------------
// Design tokens (sampled from the reference InDesign export)
// ---------------------------------------------------------------------------
const TOKENS = {
  primaryBlue: "#2461C4",
  primaryBlueDark: "#1E4FA0",
  paleSectionBg: "#D9E6F7",
  cardGreyBg: "#F5F6F8",
  strokeBorder: "#CBD5E1",
  textDark: "#1F2937",
  textMuted: "#64748B",
  white: "#FFFFFF",
  fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
  donutShades: ["#2461C4", "#3B74D1", "#5A8BDE", "#7BA3E8", "#9CBBF0"],
};

// A4 rendered at 96dpi, then rasterized at 2x for crisp output.
const PAGE_W_PX = 794;
const PAGE_H_PX = 1123;
const RENDER_SCALE = 2;

// ---------------------------------------------------------------------------
// Dynamic library loading (so callers don't have to edit their HTML)
// ---------------------------------------------------------------------------
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: any;
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timeout (${ms}ms): ${label}`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timer),
  ) as Promise<T>;
}

function loadScript(src: string): Promise<void> {
  const job = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${src}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      // Already injected (possibly still loading from a previous call) — poll for readiness.
      if ((existing as any)._loaded) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load ${src}`)),
      );
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      (s as any)._loaded = true;
      resolve();
    };
    s.onerror = () =>
      reject(new Error(`Failed to load ${src} (blocked by network/CSP?)`));
    document.head.appendChild(s);
  });
  // Never let a single script hang the whole PDF generation forever.
  return withTimeout(job, 8000, `loading ${src}`);
}

async function ensureLibs(): Promise<void> {
  if (typeof html2canvas !== "undefined") return;
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  );
}

// ---------------------------------------------------------------------------
// Donut / ring diagram (real curved labels via SVG <textPath>, rasterized
// natively by the browser so we don't depend on html2canvas' SVG support)
// ---------------------------------------------------------------------------
async function renderDonutDataUrl(
  segments: string[],
  size = 340,
): Promise<string> {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.27;
  const n = segments.length;
  const gapDeg = 2.2; // small gap between segments

  function polar(r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(startDeg: number, endDeg: number) {
    const p1 = polar(outerR, startDeg);
    const p2 = polar(outerR, endDeg);
    const p3 = polar(innerR, endDeg);
    const p4 = polar(innerR, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${p1.x} ${p1.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
      "Z",
    ].join(" ");
  }

  function labelArcPath(startDeg: number, endDeg: number, id: string) {
    // path at mid-radius used purely to lay text along the curve
    const r = (outerR + innerR) / 2;
    // flip direction on the bottom half so text isn't upside down
    const mid = (startDeg + endDeg) / 2;
    const flip = mid > 90 && mid < 270;
    const a = flip ? endDeg : startDeg;
    const b = flip ? startDeg : endDeg;
    const p1 = polar(r, a);
    const p2 = polar(r, b);
    const large = Math.abs(b - a) > 180 ? 1 : 0;
    const sweep = flip ? 0 : 1;
    return `<path id="${id}" d="M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} ${sweep} ${p2.x} ${p2.y}" fill="none" />`;
  }

  const step = 360 / n;
  let defs = "";
  let paths = "";
  let labels = "";

  segments.forEach((label, i) => {
    const start = -90 + i * step + gapDeg / 2;
    const end = -90 + (i + 1) * step - gapDeg / 2;
    const color = TOKENS.donutShades[i % TOKENS.donutShades.length];
    paths += `<path d="${arcPath(start, end)}" fill="${color}" />`;
    const id = `seg-label-${i}`;
    defs += labelArcPath(start, end, id);
    labels += `
      <text font-size="10.5" font-weight="700" fill="#ffffff" font-family="${TOKENS.fontFamily}">
        <textPath href="#${id}" startOffset="50%" text-anchor="middle">${label}</textPath>
      </text>`;
  });

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>${defs}</defs>
    ${paths}
    ${labels}
    <circle cx="${cx}" cy="${cy}" r="${innerR - 2}" fill="${TOKENS.primaryBlue}" />
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-weight="700"
      fill="#ffffff" font-family="${TOKENS.fontFamily}">Personality</text>
  </svg>`;

  return svgToRasterDataUrl(svg, size, size);
}

function svgToRasterDataUrl(
  svgMarkup: string,
  width: number,
  height: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * RENDER_SCALE;
      canvas.height = height * RENDER_SCALE;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(RENDER_SCALE, RENDER_SCALE);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Word cloud — custom, dependency-free, spiral-placement renderer.
//
// We deliberately do NOT use wordcloud2.js here anymore: it places words
// mostly synchronously, so on a canvas too small for the requested font
// sizes it can block the main thread for a very long time (looks exactly
// like an infinite load, and no timeout/Promise trick can rescue you from
// blocking synchronous code). This version uses a bounded Archimedean-
// spiral search per word (hard step cap) so it always finishes in a
// predictable, small number of iterations — no CDN, no async, no hang.
// ---------------------------------------------------------------------------
interface PlacedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function boxesOverlap(a: PlacedBox, b: PlacedBox, margin = 2): boolean {
  return !(
    a.x + a.w + margin < b.x ||
    b.x + b.w + margin < a.x ||
    a.y + a.h + margin < b.y ||
    b.y + b.h + margin < a.y
  );
}

function colorToCss(c: string | number[]): string {
  if (Array.isArray(c)) return `rgb(${c[0]},${c[1]},${c[2]})`;
  return c;
}

async function renderWordCloudDataUrl(
  words: { text: string; size: number; color: number[] | string }[],
  width = 520,
  height = 260,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * RENDER_SCALE;
      canvas.height = height * RENDER_SCALE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      // fallback to transparent canvas
      const canvas = document.createElement("canvas");
      canvas.width = width * RENDER_SCALE;
      canvas.height = height * RENDER_SCALE;
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = "/images/wordcloud.png";
  });
}

// ---------------------------------------------------------------------------
// HTML page templates
// ---------------------------------------------------------------------------
function decorativeBorderHtml(): string {
  return `
    <div style="position:absolute; top:22px; left:36px; right:36px; height:3px; background:${TOKENS.primaryBlue};"></div>
    <div style="position:absolute; top:16px; left:36px; width:12px; height:12px; border-radius:50%; background:${TOKENS.primaryBlue};"></div>
    <div style="position:absolute; top:19px; left:58px; width:7px; height:7px; border-radius:50%; background:${TOKENS.primaryBlue};"></div>
    <div style="position:absolute; top:16px; right:36px; width:12px; height:12px; border-radius:50%; background:${TOKENS.primaryBlue};"></div>
    <div style="position:absolute; top:19px; right:58px; width:7px; height:7px; border-radius:50%; background:${TOKENS.primaryBlue};"></div>
    <div style="position:absolute; top:8px; left:8px; right:8px; bottom:8px; border:1px solid ${TOKENS.strokeBorder}; pointer-events:none;"></div>
  `;
}

const TRAIT_ICONS: Record<string, string> = {
  Openness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.002 6.5a3 3 0 0 1-.399-1.375"/><path d="M11.5 16a1.5 1.5 0 0 0 1 0"/><path d="M9.7 14.4a1.5 1.5 0 0 1 4.6 0"/><path d="M10 12a1 1 0 0 0 4 0"/></svg>`,
  Conscientiousness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`,
  Agreeableness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>`,
  Extroversion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  Neuroticism: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
};

function buildCardHtml(c: { label: string; score: number; max: number }): string {
  return `
    <div style="width:210px; font-family:${TOKENS.fontFamily}; text-align:left; margin-bottom:10px;">
      <div style="font-weight:700; font-size:12.5px; color:${TOKENS.textDark}; margin-bottom:8px; min-height:36px; display:flex; align-items:flex-end; line-height:1.2;">
        ${c.label}
      </div>
      <div style="position:relative; background:${TOKENS.cardGreyBg}; border-radius:6px; padding:14px 16px; border:1px solid #e2e8f0; height:68px; box-sizing:border-box;">
        <div style="font-size:10px; color:${TOKENS.textMuted}; margin-bottom:4px;">Your Score:</div>
        <div style="font-size:11px; color:${TOKENS.primaryBlue}; font-weight:700;">Maximum Score: ${c.max}</div>
        <div style="position:absolute; top:-16px; right:-12px; width:52px; height:52px; border-radius:50%;
                    background:${TOKENS.primaryBlue}; color:#fff; display:flex; align-items:center; justify-content:center;
                    font-size:22px; font-weight:800; box-shadow:0 3px 6px rgba(36,97,196,0.3); border:3px solid #fff; z-index:1;">
          ${c.score}
        </div>
      </div>
    </div>
  `;
}

function buildPage1Html(
  testName: string,
  cards: { label: string; score: number; max: number }[],
  descriptionTitle: string,
  descriptionParagraphs: string[],
  donutDataUrl: string,
): string {
  const cols = Math.min(3, cards.length);
  const circles = cards.map((c) => buildCardHtml(c)).join("");
  const cardsHtml = `<div style="display:grid; grid-template-columns: repeat(${cols}, 210px); gap: 24px 36px; justify-content: center; margin-top: 24px;">${circles}</div>`;

  const paragraphsHtml = descriptionParagraphs
    .map((p) => `<p style="margin:0 0 12px 0;">${p}</p>`)
    .join("");

  return `
  <div style="position:relative; width:${PAGE_W_PX}px; height:${PAGE_H_PX}px; background:#fff;
              font-family:${TOKENS.fontFamily}; box-sizing:border-box; overflow:hidden;">
    ${decorativeBorderHtml()}
    <div style="padding:46px 46px 0 46px;">
      <h1 style="color:${TOKENS.primaryBlue}; text-align:center; font-size:40px; font-weight:800; margin:0; letter-spacing:-1px;">
        ${testName}
      </h1>
      ${cardsHtml}
    </div>

    <div style="margin:46px 30px 0 30px; position:relative; background:${TOKENS.paleSectionBg}; border-radius:10px; padding:32px 22px 22px 22px;">
      <div style="position:absolute; top:-18px; left:30px; background:${TOKENS.primaryBlueDark}; color:#fff; font-weight:700;
                  font-size:16px; padding:10px 24px; border-radius:20px;
                  box-shadow:0 4px 8px rgba(0,0,0,0.2);">
        ${descriptionTitle}
      </div>
      <div style="background:#fff; border-radius:10px; padding:24px; display:flex; align-items:center;
                  box-shadow:0 4px 10px rgba(0,0,0,0.06);">
        <div style="flex:1; font-size:10.5px; line-height:1.6; color:${TOKENS.textDark}; padding-right:20px;">
          ${paragraphsHtml}
        </div>
        <div style="flex-shrink:0;">
          <img src="${donutDataUrl}" style="width:180px; height:180px;" />
        </div>
      </div>
    </div>
  </div>`;
}

function traitBlockHtml(
  title: string,
  wordCloudDataUrl: string,
  paragraphs: string[],
  accentColor: string,
): string {
  const paragraphsHtml = paragraphs
    .map((p) => `<p style="margin:0 0 10px 0;">${p}</p>`)
    .join("");

  let iconsHtml = "";
  const traitOrder = [
    "Openness",
    "Conscientiousness",
    "Agreeableness",
    "Extroversion",
    "Neuroticism",
  ];
  if (TRAIT_ICONS[title]) {
    iconsHtml = traitOrder
      .map((t) => {
        const isActive = t === title;
        const size = isActive ? 28 : 20;
        const color = isActive ? accentColor : TOKENS.textMuted;
        const opacity = isActive ? 1 : 0.4;
        const margin = isActive ? "0 10px" : "0 5px";
        return `<div style="width:${size}px; height:${size}px; color:${color}; opacity:${opacity}; margin:${margin}; display:flex; align-items:center; justify-content:center;">${TRAIT_ICONS[t]}</div>`;
      })
      .join("");
    iconsHtml = `<div style="display:flex; align-items:center; margin-left:20px;">${iconsHtml}</div>`;
  }

  return `
    <div style="padding:0 40px;">
      <img src="${wordCloudDataUrl}" style="display:block; width:100%; height:auto; margin-bottom:12px;" />
      <div style="display:flex; align-items:center; margin-bottom:12px;">
        <div style="width:34px; height:34px; color:${accentColor}; margin-right:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
          ${TRAIT_ICONS[title] || `<div style="width:100%; height:100%; background:${accentColor}; border-radius:50%;"></div>`}
        </div>
        <div style="font-size:24px; font-weight:800; color:${TOKENS.textDark};">${title}</div>
        ${iconsHtml}
      </div>
      <div style="font-size:10px; line-height:1.6; color:${TOKENS.textDark}; column-count:1;">
        ${paragraphsHtml}
      </div>
    </div>`;
}

function buildTraitPageHtml(blocksHtml: string[]): string {
  return `
  <div style="position:relative; width:${PAGE_W_PX}px; height:${PAGE_H_PX}px; background:#fff;
              font-family:${TOKENS.fontFamily}; box-sizing:border-box; overflow:hidden;">
    ${decorativeBorderHtml()}
    <div style="padding:50px 0 0 0; display:flex; flex-direction:column; height:100%;">
      ${blocksHtml
        .map(
          (b, i) => `
        <div style="flex:1; ${i === 0 ? `border-bottom:1px solid ${TOKENS.strokeBorder}; padding-bottom:16px;` : "padding-top:16px;"}">
          ${b}
        </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

function referencesBoxHtml(refs: string[]): string {
  const items = refs
    .map(
      (r) =>
        `<div style="font-size:6.6px; line-height:1.35; color:${TOKENS.textDark}; margin-bottom:6px;">${r}</div>`,
    )
    .join("");
  return `
    <div style="margin:16px 40px 0 40px;">
      <div style="background:${TOKENS.primaryBlue}; color:#fff; font-weight:700; font-size:11px;
                  padding:8px 16px; border-radius:6px 6px 0 0;">References</div>
      <div style="background:#f8fafc; border:1px solid ${TOKENS.strokeBorder}; border-top:none;
                  border-radius:0 0 6px 6px; padding:12px 16px;">
        ${items}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Render one HTML string into a full-resolution canvas and add it as a page
// ---------------------------------------------------------------------------
async function addHtmlPageToDoc(
  doc: any,
  html: string,
  isFirstPage: boolean,
): Promise<void> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${PAGE_W_PX}px`;
  container.style.height = `${PAGE_H_PX}px`;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await withTimeout(
      html2canvas(container, {
        scale: RENDER_SCALE,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: PAGE_W_PX,
        height: PAGE_H_PX,
      }),
      15000,
      "html2canvas page render",
    );
    const imgData = (canvas as HTMLCanvasElement).toDataURL("image/jpeg", 0.95);
    if (!isFirstPage) doc.addPage();
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297); // A4 mm
  } finally {
    document.body.removeChild(container);
  }
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------
export interface CriterionInput {
  code: string;
  name: string;
  score: number;
  maxScore: number;
}

export interface TraitContent {
  title: string;
  words: { text: string; size: number; color: number[] }[];
  paragraphs: string[];
  accentColor: string;
}

export async function generatePixelPerfectPdf(opts: {
  testCode: string;
  testName: string;
  criteria: CriterionInput[];
  descriptionTitle: string;
  descriptionParagraphs: string[];
  traits?: TraitContent[]; // only for BIG5
  references?: string[];
}): Promise<string> {
  // If html2canvas / wordcloud2.js can't load in 8s (blocked CDN, offline,
  // strict CSP...), fail fast with a clear error instead of spinning forever.
  await withTimeout(ensureLibs(), 10000, "loading html2canvas/wordcloud2.js");

  const { jsPDF } = jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const donutSegments = opts.criteria.map((c) => c.name);
  const donutDataUrl = await renderDonutDataUrl(donutSegments);

  const page1Html = buildPage1Html(
    opts.testName,
    opts.criteria.map((c) => ({
      label: c.name,
      score: c.score,
      max: c.maxScore,
    })),
    opts.descriptionTitle,
    opts.descriptionParagraphs,
    donutDataUrl,
  );
  await addHtmlPageToDoc(doc, page1Html, true);

  if (opts.testCode === "BIG5" && opts.traits && opts.traits.length) {
    const traitBlocks: string[] = [];
    for (const trait of opts.traits) {
      const cloudUrl = await renderWordCloudDataUrl(trait.words, 620, 240);
      traitBlocks.push(
        traitBlockHtml(
          trait.title,
          cloudUrl,
          trait.paragraphs,
          trait.accentColor,
        ),
      );
    }

    for (let i = 0; i < traitBlocks.length; i += 2) {
      const pair = traitBlocks.slice(i, i + 2);
      const isLastPage = i + 2 >= traitBlocks.length;
      let html = buildTraitPageHtml(pair);
      if (isLastPage && opts.references && opts.references.length) {
        // append references below the last block on the final page
        html = html.replace(
          "</div>\n  </div>",
          `${referencesBoxHtml(opts.references)}</div>\n  </div>`,
        );
      }
      await addHtmlPageToDoc(doc, html, false);
    }
  }

  return doc.output("bloburl");
}

// ---------------------------------------------------------------------------
// Test detail metadata (criteria names, descriptions, word clouds, etc.)
// ---------------------------------------------------------------------------
interface TestDetail {
  name: string;
  subtitle: string;
  descriptionTitle: string;
  descriptionText: string;
  criteria: Record<string, { name: string; description: string }>;
  traits?: TraitContent[];
  references?: string[];
}

const testDetailsMap: Record<string, TestDetail> = {
  BIG5: {
    name: "Big 5",
    subtitle: "Your personality profile across the five dimensions",
    descriptionTitle: "What are the Big Five personality traits?",
    descriptionText:
      'The Big Five Personality Model, or better known as "the Big Five," is a comprehensive model that assesses personality attributes through responses in five personality trait categories. The model covers a wide range of personality tendencies, which fall into the categories of Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.\n\nThese categories are umbrella terms for the overarching themes in personality tendencies. Results from this model capture someone\'s characteristics and can be a strong predictor of how someone will work in a particular environment. It is important to note that all trait scores are valuable; not one is better or worse than another.',
    criteria: {
      C: {
        name: "Conscientiousness",
        description: "Organization, discipline, reliability.",
      },
      O: {
        name: "Openness to experience",
        description: "Intellectual curiosity, imagination.",
      },
      E: {
        name: "Extraversion and Introversion",
        description: "Sociability, energy from interactions.",
      },
      A: {
        name: "Agreeableness",
        description: "Empathy, cooperation, social harmony.",
      },
      ES: {
        name: "Emotional Stability",
        description: "Resilience to stress, calmness.",
      },
    },
    traits: [
      {
        title: "Openness",
        accentColor: TOKENS.primaryBlue,
        words: [
          { text: "Imagination", size: 22, color: [34, 68, 236] },
          { text: "Creativity", size: 16, color: [16, 185, 129] },
          { text: "Intellect", size: 14, color: [139, 92, 246] },
          { text: "Aesthetic", size: 12, color: [244, 63, 94] },
          { text: "Novelty", size: 11, color: [245, 158, 11] },
          { text: "Artistic", size: 13, color: [6, 182, 212] },
          { text: "Fantasy", size: 11, color: [100, 116, 139] },
          { text: "Curiosity", size: 13, color: [34, 68, 236] },
          { text: "Ideas", size: 15, color: [16, 185, 129] },
          { text: "Openness", size: 18, color: [34, 68, 236] },
        ],
        paragraphs: [
          "Openness defines one's willingness to try new things, capacity to use imagination, and ability to conceptualize abstract ideas.",
          "For example, do you spend time deeply reflecting on things or imagining creative solutions to problems? This could be an indicator of having a high level of openness.",
          "An example of this would be a financial analyst or accountant. These roles suit low openness scores as they are data-driven and involve fixed routines.",
        ],
      },
      {
        title: "Conscientiousness",
        accentColor: "#10B981",
        words: [
          { text: "Industriousness", size: 22, color: [16, 185, 129] },
          { text: "Persistence", size: 18, color: [139, 92, 246] },
          { text: "Orderliness", size: 15, color: [34, 68, 236] },
          { text: "Self-Discipline", size: 14, color: [244, 63, 94] },
          { text: "Dependability", size: 12, color: [245, 158, 11] },
          { text: "Goal-orientation", size: 13, color: [6, 182, 212] },
          { text: "Reliability", size: 11, color: [100, 116, 139] },
          { text: "Structure", size: 13, color: [16, 185, 129] },
          { text: "Responsibility", size: 17, color: [16, 185, 129] },
        ],
        paragraphs: [
          "Conscientiousness involves someone's level of attention to detail and organization. Other defining attributes include thoughtfulness, impulse control, self-discipline, and your ability to stay focused.",
          "In the business setting, conscientiousness can be displayed by scheduling meetings in advance or finishing a project before its deadline.",
          "Nursing and Human Resources are often associated with high scores of conscientiousness, as the detail and emphasis on deadlines are essential.",
        ],
      },
      {
        title: "Agreeableness",
        accentColor: "#F43F5E",
        words: [
          { text: "Compassion", size: 22, color: [244, 63, 94] },
          { text: "Cooperation", size: 15, color: [16, 185, 129] },
          { text: "Altruism", size: 14, color: [34, 68, 236] },
          { text: "Sympathy", size: 12, color: [245, 158, 11] },
          { text: "Empathy", size: 13, color: [6, 182, 212] },
          { text: "Harmony", size: 11, color: [100, 116, 139] },
          { text: "Kindness", size: 11, color: [16, 185, 129] },
          { text: "Trust", size: 17, color: [244, 63, 94] },
        ],
        paragraphs: [
          "One of the most vital characteristics for working well with others is agreeableness. This trait encompasses one's ability to empathize, help others, and perceived trustworthiness.",
          "People who score high in agreeableness are more self-aware, making them effective team members.",
          "Careers well-suited for people who score low on this trait often include software developers, engineers, and programmers.",
        ],
      },
      {
        title: "Extroversion",
        accentColor: TOKENS.primaryBlue,
        words: [
          { text: "Sociability", size: 22, color: [34, 68, 236] },
          { text: "Friendliness", size: 18, color: [139, 92, 246] },
          { text: "Warmth", size: 15, color: [16, 185, 129] },
          { text: "Assertiveness", size: 14, color: [244, 63, 94] },
          { text: "Cheerfulness", size: 12, color: [245, 158, 11] },
          { text: "Outgoing", size: 13, color: [6, 182, 212] },
          { text: "Energy", size: 17, color: [34, 68, 236] },
        ],
        paragraphs: [
          "Extroversion is a trait that describes someone's ability to interact socially with others. The higher the score, the more sociable and comfortable someone is.",
          "An extroverted person would thrive in positions where team collaboration is crucial, but might feel stunted in roles that require extensive individual work.",
          "Examples of extroverted positions are in teaching, sales, and marketing.",
        ],
      },
      {
        title: "Neuroticism",
        accentColor: "#F43F5E",
        words: [
          { text: "Anxiety", size: 22, color: [244, 63, 94] },
          { text: "Sensitivity", size: 18, color: [139, 92, 246] },
          { text: "Tension", size: 15, color: [16, 185, 129] },
          { text: "Worry", size: 14, color: [34, 68, 236] },
          { text: "Depression", size: 12, color: [245, 158, 11] },
          { text: "Moodiness", size: 13, color: [244, 63, 94] },
          { text: "Fear", size: 17, color: [244, 63, 94] },
        ],
        paragraphs: [
          "Neuroticism describes the worry, anxiety, frustration, and anger we feel at times. People who score highly tend to struggle with emotional regulation.",
          "Neuroticism is not inherently a bad trait, as worry and anxiety can be beneficial in certain situations.",
          "Researchers suggest that practicing mindfulness can be a helpful tool. Check out this guide from PsychCentral!",
        ],
      },
    ],
    references: [
      "1. Wikimedia Foundation. (2024). Big five personality traits. Wikipedia.",
      "2. Darby, J. (2024). What are the big 5 personality traits?. Thomas International.",
      "3. Gillette, H. (2022). Neuroticism: What it means, signs, and tips to cope. Psych Central.",
      "4. Raypole, C. (2019). Big five personality traits. Healthline.",
      "5. Le, A. T. (2020). The Big Five's agreeableness. Our Human Minds.",
      "6. GeeksforGeeks. (2023). Big five personality traits.",
    ],
  },
  ASSERTIVENESS: {
    name: "Assertiveness",
    subtitle: "Your level of assertiveness in social and work environments",
    descriptionTitle: "What is Assertiveness?",
    descriptionText:
      "Assertiveness is the quality of being self-assured and confident without being aggressive. It is a key communication skill that allows you to express your point of view, opinions, and feelings in a way that is honest, direct, and respectful of others.",
    criteria: {
      ASSERTIVENESS: {
        name: "Assertiveness",
        description:
          "Speaking up for oneself honestly, directly, and respectfully.",
      },
    },
  },
  CREATIVE_ANALYTICAL: {
    name: "Creative or Analytical",
    subtitle: "Are you a creative or analytical thinker?",
    descriptionTitle: "What is Creative & Analytical Thinking?",
    descriptionText:
      "Modern work environments value both creativity and analytical rigor. Understanding your balance between these two styles allows you to leverage your strengths.",
    criteria: {
      CREATIVE: {
        name: "Creative Thinking",
        description: "Generating novel solutions.",
      },
      ANALYTICAL: {
        name: "Analytical Thinking",
        description: "Logical reasoning, data interpretation.",
      },
    },
  },
  ENTREPRENEUR: {
    name: "Entrepreneur",
    subtitle: "Your affinity for entrepreneurial leadership and risk taking",
    descriptionTitle: "What is the Entrepreneurial Profile?",
    descriptionText:
      "An entrepreneurial profile indicates an individual's drive to initiate, build, and lead new projects or ventures.",
    criteria: {
      ENTREPRENEURSHIP: {
        name: "Entrepreneurship",
        description: "Interest in autonomy, leadership, business building.",
      },
    },
  },
  INTELLECTUAL_CURIOSITY: {
    name: "Intellectual Curiosity",
    subtitle: "Your drive to seek deep answers and learn new things",
    descriptionTitle: "What is Intellectual Curiosity?",
    descriptionText:
      "Intellectual curiosity is the desire to seek deep answers, learn new concepts, and understand how the world works.",
    criteria: {
      INTELLECTUAL_CURIOSITY: {
        name: "Intellectual Curiosity",
        description: "Desire to learn, ask deep questions.",
      },
    },
  },
  SELF_MOTIVATION: {
    name: "Self-Motivation",
    subtitle: "Your drive to achieve long-term and short-term goals",
    descriptionTitle: "What is Self-Motivation?",
    descriptionText:
      "Self-motivation is the internal drive that prompts us to take action, achieve goals, and persist in the face of obstacles.",
    criteria: {
      SELF_MOTIVATION: {
        name: "Self-Motivation",
        description: "Internal drive to act, plan, set goals.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// IIFE entry point — runs on page load
// ---------------------------------------------------------------------------

const personalityService = new PersonalityService();

(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const testCode = (urlParams.get("test") || "BIG5").toUpperCase();
  const session = getSession();

  if (!session || !session.profileId) {
    window.location.href = "../login.php";
    return;
  }

  const profileId = session.profileId;
  const testDetail = testDetailsMap[testCode];

  if (!testDetail) {
    console.error("[result.ts] Unknown test code:", testCode);
    return;
  }

  // Update Page Header
  const titleEl = document.querySelector(".res-test-title");
  const subtitleEl = document.querySelector(".res-test-subtitle");
  if (titleEl) titleEl.textContent = testDetail.name;
  if (subtitleEl) subtitleEl.textContent = testDetail.subtitle;

  try {
    // 1. Fetch data from API
    const [testResponse, savedAnswersResponse] = await Promise.all([
      personalityService.getTestByCode(testCode),
      personalityService.getSavedAnswers(profileId, testCode),
    ]);

    const testDb = testResponse[0];
    if (!testDb) {
      console.error("[result.ts] Test not found in database:", testCode);
      return;
    }

    const [questionsDb, criteriaDb] = await Promise.all([
      personalityService.getQuestionsByTestId(testDb.id),
      personalityService.getCriteriaByTestId(testDb.id),
    ]);

    // 2. Compute scores
    const answers = savedAnswersResponse.answers || {};
    const computedScores: Record<
      string,
      { rawScore: number; maxScore: number; percentage: number }
    > = {};

    criteriaDb.forEach((crit: any) => {
      const critQuestions = questionsDb.filter(
        (q: any) => q.criterion_id === crit.id,
      );
      let sum = 0;
      let count = 0;

      critQuestions.forEach((q: any) => {
        const answerVal = answers[String(q.order)] ?? answers[`q${q.order}`];
        if (answerVal === undefined || answerVal === null) return;

        let scoreNum = 1;
        if (answerVal === "yes") scoreNum = 5;
        else if (answerVal === "no") scoreNum = 1;
        else scoreNum = Number(answerVal);

        const finalScore = q.reverse_scored ? 6 - scoreNum : scoreNum;
        sum += finalScore;
        count++;
      });

      const maxScore = count * 5;
      const percentage = maxScore > 0 ? Math.round((sum / maxScore) * 100) : 0;
      computedScores[crit.code] = { rawScore: sum, maxScore, percentage };
    });

    // 3. Render Score Cards to the DOM
    const scoreCardsContainer = document.getElementById("scoreCardsContainer");
    if (scoreCardsContainer) {
      scoreCardsContainer.innerHTML = "";
      criteriaDb.forEach((crit: any) => {
        const scoreInfo = computedScores[crit.code] || {
          rawScore: 0,
          maxScore: 50,
          percentage: 0,
        };
        const detailInfo = testDetail.criteria[crit.code] || {
          name: crit.name,
        };

        const card = document.createElement("div");
        card.className = "res-score-card";
        card.innerHTML = `
          <div class="res-card-label">${detailInfo.name.toUpperCase()}</div>
          <div class="res-card-score">${scoreInfo.rawScore}<span>/${scoreInfo.maxScore}</span></div>
          <div class="res-card-progress-bar">
            <div class="res-card-progress-bar-fill" style="width: ${scoreInfo.percentage}%"></div>
          </div>
        `;
        scoreCardsContainer.appendChild(card);
      });
    }

    // 4. Generate PDF and load into iframe
    const criteriaInput = criteriaDb.map((crit: any) => ({
      code: crit.code,
      name: (testDetail.criteria[crit.code] || { name: crit.name }).name,
      score: (computedScores[crit.code] || { rawScore: 0 }).rawScore,
      maxScore: (computedScores[crit.code] || { maxScore: 50 }).maxScore,
    }));

    const pdfUrl = await generatePixelPerfectPdf({
      testCode,
      testName: `Your results · ${testDetail.name} test`,
      criteria: criteriaInput,
      descriptionTitle: testDetail.descriptionTitle,
      descriptionParagraphs: testDetail.descriptionText.split("\n\n"),
      traits: testDetail.traits,
      references: testDetail.references,
    });

    const iframe = document.getElementById(
      "pdfViewer",
    ) as HTMLIFrameElement | null;
    const loader = document.getElementById("pdfLoader");
    if (iframe) {
      iframe.src = pdfUrl;
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
        }, 400);
      }
    }
  } catch (err) {
    console.error("[result.ts] Error rendering results:", err);
    const loader = document.getElementById("pdfLoader");
    if (loader) {
      loader.style.display = "none";
    }
  }
})();
