import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
config({ path: resolve(rootDir, ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationFile = process.argv[2] ?? "0001_families.sql";
const sqlPath = resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  `../src/db/migrations/${migrationFile}`,
);
const migration = readFileSync(sqlPath, "utf8");

const db = postgres(url);
try {
  await db.unsafe(migration);
  console.log("Migration applied:", sqlPath);
} finally {
  await db.end();
}
