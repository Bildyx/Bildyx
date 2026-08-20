import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../"), "");

  if (!env.API_URL) {
    console.error("ERREUR: API_URL est manquant dans le fichier .env !");
    process.exit(1);
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@repo/api-client": path.resolve(
          __dirname,
          "../../packages/api-client/src/index.ts",
        ),
        "@repo/models": path.resolve(__dirname, "../api/src/models"),
      },
    },
    define: {
      "process.env.API_URL": JSON.stringify(env.API_URL || ""),
      "process.env.FRONTEND_URL": JSON.stringify(env.FRONTEND_URL || ""),
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL || ""),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(
        env.SUPABASE_ANON_KEY || "",
      ),
    },
    server: {
      port: 5173,
    },
  };
});
