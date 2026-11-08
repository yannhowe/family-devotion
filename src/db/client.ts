import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { DatabaseConfigError } from "./errors";
import { schema } from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

type DatabaseConfig = {
  url: string;
  authToken?: string;
};

let client: Client | null = null;
let database: Database | null = null;
let openUrl: string | null = null;

export function resolveDatabaseConfig(): DatabaseConfig {
  const configured = [process.env.DATABASE_URL, process.env.TURSO_DATABASE_URL]
    .map((value) => value?.trim())
    .find((value) => Boolean(value));
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

  if (!configured) {
    if (process.env.VERCEL) {
      throw new DatabaseConfigError(
        "This deployment needs its own database. Use the Deploy button so Vercel can create a Turso database, or set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (DATABASE_URL is also accepted).",
      );
    }
    return { url: "file:./data/devotion.db" };
  }

  if (isRemoteUrl(configured) && !authToken) {
    throw new DatabaseConfigError(
      "The database URL is set, but TURSO_AUTH_TOKEN is missing. Add the token from your Turso database, then open the site again.",
    );
  }

  return {
    url: configured,
    authToken: isRemoteUrl(configured) ? authToken : undefined,
  };
}

export function getDatabase() {
  const config = resolveDatabaseConfig();
  if (client && database && openUrl === config.url) {
    return { client, database };
  }

  closeDatabase();
  ensureSqliteDirectory(config.url);
  client = createClient({
    url: config.url,
    authToken: config.authToken,
  });
  database = drizzle(client, { schema });
  openUrl = config.url;
  return { client, database };
}

export function closeDatabase() {
  client?.close();
  client = null;
  database = null;
  openUrl = null;
}

function isRemoteUrl(url: string) {
  return /^(libsql|https?|wss?):/i.test(url);
}

function ensureSqliteDirectory(url: string) {
  if (!url.startsWith("file:")) return;
  const filePath = sqlitePath(url);
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function sqlitePath(url: string) {
  let filePath = url.slice("file:".length);
  if (filePath.startsWith("///")) {
    filePath = filePath.slice(2);
  }
  if (path.isAbsolute(filePath)) return filePath;
  if (filePath === "./data/devotion.db" || filePath === "data/devotion.db") {
    return path.join(process.cwd(), "data", "devotion.db");
  }
  return path.resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    filePath,
  );
}
