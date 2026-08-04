import * as esbuild from "esbuild";
import { readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const jsDir = fileURLToPath(new URL("./js", import.meta.url));
const outDir = fileURLToPath(new URL("./js/dist", import.meta.url));

// Collect all .ts entry points in js/ (not in subdirs)
const entryPoints = readdirSync(jsDir)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => join(jsDir, f));

const isWatch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints,
  outdir: outDir,
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  sourcemap: isWatch ? "inline" : false,
  minify: !isWatch,
  logLevel: "info",
});

if (isWatch) {
  await ctx.watch();
  console.log("esbuild: watching for changes in js/*.ts ...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("esbuild: build complete → js/dist/");
}
