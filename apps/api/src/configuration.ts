export const NODE_ENV = process.env["NODE_ENV"] ?? "development";

export const PORT = Number.parseInt(process.env["PORT"] ?? "3000", 10);
export const HOST = process.env["HOST"] ?? "0.0.0.0";
export const API_URL = process.env["API_URL"] ?? `http://${HOST}:${PORT}`;
export const FRONTEND_URL = process.env["FRONTEND_URL"] ?? "http://localhost:8000";
export const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ??
  "http://localhost:8000,http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
  
export const NAME = "Bildyx API";
export const VERSION = "1.0.0";
export const RPC_PREFIX = "/rpc";
export const OPENAPI_PREFIX = "/api";
