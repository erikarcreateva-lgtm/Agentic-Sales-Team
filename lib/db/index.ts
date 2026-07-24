import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!isDbConfigured()) return null;
  if (!db) {
    const sql = neon(process.env.DATABASE_URL!);
    db = drizzle(sql, { schema });
  }
  return db;
}
