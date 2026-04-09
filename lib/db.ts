import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/drizzle/schema";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

function createDatabase(client: postgres.Sql) {
  return drizzle(client, {
    logger: false,
    schema,
  });
}

type Database = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & {
  db?: Database;
  sqlClient?: postgres.Sql;
};

const sqlClient =
  globalForDatabase.sqlClient ??
  postgres(getDatabaseUrl(), {
    prepare: false,
  });

export const db =
  globalForDatabase.db ??
  createDatabase(sqlClient);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.db = db;
  globalForDatabase.sqlClient = sqlClient;
}
