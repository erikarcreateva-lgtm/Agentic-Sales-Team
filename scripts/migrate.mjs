// Applies hand-written SQL files in lib/db/migrations, in order, skipping
// ones already applied (tracked in a small _migrations table).
import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "db",
  "migrations"
);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log("No DATABASE_URL set — skipping migrations.");
  process.exit(0);
}

const sql = neon(databaseUrl);

function splitStatements(fileText) {
  return fileText
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  await sql.query(
    `create table if not exists _migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`
  );

  const applied = new Set((await sql.query("select name from _migrations")).map((r) => r.name));
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migrations to run yet.");
    return;
  }

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    const fileText = readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`apply ${file}`);
    for (const statement of splitStatements(fileText)) {
      await sql.query(statement);
    }
    await sql.query("insert into _migrations (name) values ($1)", [file]);
    ran += 1;
  }

  console.log(ran > 0 ? `Applied ${ran} migration(s).` : "Already up to date.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
