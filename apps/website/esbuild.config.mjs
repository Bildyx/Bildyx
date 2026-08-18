import * as esbuild from "esbuild";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const jsDir = fileURLToPath(new URL("./js", import.meta.url));
const outDir = fileURLToPath(new URL("./js/dist", import.meta.url));

function getEntryPoints(dir) {
    const entries = [];

    for (const file of readdirSync(dir)) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && file !== "dist") {
            entries.push(...getEntryPoints(fullPath));
        } else if (stat.isFile() && file.endsWith(".ts")) {
            entries.push(fullPath);
        }
    }

    return entries;
}

const entryPoints = getEntryPoints(jsDir);

const isWatch = process.argv.includes("--watch");

let env = {};

try {
    const envContent = readFileSync(
    fileURLToPath(new URL("../../.env", import.meta.url)),
    "utf8"
);

    for (const line of envContent.split("\n")) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

        if (match) {
            let value = match[2] || "";
            value = value.trim();

            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }

            env[match[1]] = value;
        }
    }
} catch (e) {
    console.log(
        "No .env found, skipping environment variables injection",
        e
    );
}

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
    define: {
        "process.env.FRONTEND_URL": JSON.stringify(env.FRONTEND_URL || ""),
        "process.env.API_URL": JSON.stringify(env.API_URL || ""),
        "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL || ""),
        "process.env.SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY || ""),
    },
});

if (isWatch) {
    await ctx.watch();
    console.log("esbuild: watching for changes in js/**/*.ts ...");
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log("esbuild: build complete → js/dist/");
}