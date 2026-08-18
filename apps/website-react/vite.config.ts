import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@repo/api-client": path.resolve(__dirname, "../../packages/api-client/src/index.ts"),
      "@repo/models": path.resolve(__dirname, "../api/src/models"),
    },
  },
  server: {
    port: 5173,
  },
});

