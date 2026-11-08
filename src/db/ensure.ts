import type { Client } from "@libsql/client";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase, type Database } from "./client";
import { migrationSql } from "./migration-sql";
import { prayerTopics, prayers, topics, verseTopics, verses } from "./schema";
import { seedPrayers, seedTopics, seedVerses } from "./seed-data";

let ready: Promise<void> | null = null;

export function ensureDatabase() {
  if (!ready) {
    ready = setup().catch((error: unknown) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export function resetDatabaseForTests() {
  ready = null;
}

async function setup() {
  const { client, database } = getDatabase();
  try {
    await client.execute("PRAGMA foreign_keys = ON");
    await client.execute("PRAGMA busy_timeout = 5000");
    await applyMigrations(client);
    await seed(database);
  } catch (error) {
    closeDatabase();
    throw error;
  }
}

async function applyMigrations(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const applied = await client.execute({
    sql: "SELECT id FROM schema_migrations WHERE id = ?",
    args: ["0000_init"],
  });
  if (applied.rows.length > 0) return;

  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  await client.execute({
    sql: "INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES (?, ?)",
    args: ["0000_init", Date.now()],
  });
}

function isUniqueConstraint(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  if (/UNIQUE|SQLITE_CONSTRAINT/i.test(`${code} ${message}`)) return true;
  if ("cause" in error) return isUniqueConstraint(error.cause);
  return false;
}

async function seed(database: Database) {
  await database
    .insert(topics)
    .values(seedTopics)
    .onConflictDoNothing({ target: topics.slug });

  const topicRows = await database.select().from(topics);
  const topicIdBySlug = new Map(topicRows.map((topic) => [topic.slug, topic.id]));

  await database
    .insert(verses)
    .values(
      seedVerses.map((verse) => ({
        reference: verse.reference,
        text: verse.text,
        translation: verse.translation,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing({
      target: [verses.reference, verses.translation],
    });

  const verseRows = await database.select().from(verses);
  const verseIdByKey = new Map(
    verseRows.map((verse) => [
      `${verse.reference}::${verse.translation}`,
      verse.id,
    ]),
  );

  const verseLinks = seedVerses.flatMap((verse) => {
    const verseId = verseIdByKey.get(`${verse.reference}::${verse.translation}`);
    if (!verseId) return [];
    return verse.topics.flatMap((slug) => {
      const topicId = topicIdBySlug.get(slug);
      return topicId ? [{ verseId, topicId }] : [];
    });
  });
  if (verseLinks.length > 0) {
    await database.insert(verseTopics).values(verseLinks).onConflictDoNothing();
  }

  for (const prayer of seedPrayers) {
    const existing = await database
      .select({ id: prayers.id })
      .from(prayers)
      .where(eq(prayers.scriptureReference, prayer.scriptureReference))
      .limit(1);

    let prayerId = existing[0]?.id;
    if (!prayerId) {
      try {
        const inserted = await database
          .insert(prayers)
          .values({
            title: prayer.title,
            author: prayer.author,
            body: prayer.body,
            scriptureReference: prayer.scriptureReference,
            notes: prayer.notes,
            createdAt: new Date(),
          })
          .returning({ id: prayers.id });
        prayerId = inserted[0]?.id;
      } catch (error) {
        if (!isUniqueConstraint(error)) throw error;
        const again = await database
          .select({ id: prayers.id })
          .from(prayers)
          .where(eq(prayers.scriptureReference, prayer.scriptureReference))
          .limit(1);
        prayerId = again[0]?.id;
      }
    }
    if (!prayerId) continue;

    const links = prayer.topics.flatMap((slug) => {
      const topicId = topicIdBySlug.get(slug);
      return topicId ? [{ prayerId: prayerId as number, topicId }] : [];
    });
    if (links.length > 0) {
      await database.insert(prayerTopics).values(links).onConflictDoNothing();
    }
  }
}
