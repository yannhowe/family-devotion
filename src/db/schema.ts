import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
});

export const verses = sqliteTable(
  "verses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reference: text("reference").notNull(),
    text: text("text").notNull(),
    translation: text("translation").notNull(),
    vestaboardText: text("vestaboard_text"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("verses_reference_translation_unique").on(
      table.reference,
      table.translation,
    ),
  ],
);

export const verseTopics = sqliteTable(
  "verse_topics",
  {
    verseId: integer("verse_id")
      .notNull()
      .references(() => verses.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.verseId, table.topicId] }),
  ],
);

export const prayers = sqliteTable(
  "prayers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author").notNull(),
    body: text("body").notNull(),
    scriptureReference: text("scripture_reference"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("prayers_scripture_reference_unique")
      .on(table.scriptureReference)
      .where(sql`${table.scriptureReference} IS NOT NULL`),
  ],
);

export const prayerTopics = sqliteTable(
  "prayer_topics",
  {
    prayerId: integer("prayer_id")
      .notNull()
      .references(() => prayers.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.prayerId, table.topicId] }),
  ],
);

export const esvCache = sqliteTable("esv_cache", {
  referenceKey: text("reference_key").primaryKey(),
  text: text("text").notNull(),
  verseCount: integer("verse_count").notNull(),
  bookId: integer("book_id").notNull(),
  fetchedAt: integer("fetched_at", { mode: "timestamp_ms" }).notNull(),
});

export const schema = {
  topics,
  verses,
  verseTopics,
  prayers,
  prayerTopics,
  esvCache,
};
