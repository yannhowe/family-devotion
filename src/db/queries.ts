import { io } from "next/cache";
import { and, asc, eq, inArray, like, or, sql } from "drizzle-orm";
import { ensureDatabase } from "./ensure";
import { getDatabase } from "./client";
import {
  prayerTopics,
  prayers,
  topics,
  verseTopics,
  verses,
} from "./schema";

export type TopicSummary = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type PrayerSummary = {
  id: number;
  title: string;
  author: string;
  body: string;
  scriptureReference: string | null;
  notes: string | null;
  topics: TopicSummary[];
};

export type VerseSummary = {
  id: number;
  reference: string;
  text: string;
  translation: string;
  topics: TopicSummary[];
};

async function open() {
  await io();
  await ensureDatabase();
  return getDatabase().database;
}

export async function listTopics() {
  const database = await open();
  return database.select().from(topics).orderBy(asc(topics.id));
}

export async function listAuthors() {
  const database = await open();
  const rows = await database
    .selectDistinct({ author: prayers.author })
    .from(prayers)
    .orderBy(asc(prayers.author));
  return rows
    .map((row) => row.author)
    .sort((left, right) => {
      if (left.toLowerCase() === "paul") return -1;
      if (right.toLowerCase() === "paul") return 1;
      return left.localeCompare(right);
    });
}

export async function listPrayers(author?: string) {
  const database = await open();
  const rows = await database
    .select()
    .from(prayers)
    .where(
      author ? sql`lower(${prayers.author}) = lower(${author})` : undefined,
    )
    .orderBy(asc(prayers.id));
  const topicMap = await topicsForPrayers(
    database,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    ...row,
    topics: topicMap.get(row.id) ?? [],
  }));
}

export async function getPrayer(id: number) {
  const database = await open();
  const rows = await database
    .select()
    .from(prayers)
    .where(eq(prayers.id, id))
    .limit(1);
  const prayer = rows[0];
  if (!prayer) return null;
  const topicMap = await topicsForPrayers(database, [prayer.id]);
  return { ...prayer, topics: topicMap.get(prayer.id) ?? [] };
}

export async function getTopicBySlug(slug: string) {
  const database = await open();
  const rows = await database
    .select()
    .from(topics)
    .where(eq(topics.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function listVersesForTopic(topicId: number) {
  const database = await open();
  return database
    .select({
      id: verses.id,
      reference: verses.reference,
      text: verses.text,
      translation: verses.translation,
    })
    .from(verseTopics)
    .innerJoin(verses, eq(verses.id, verseTopics.verseId))
    .where(eq(verseTopics.topicId, topicId))
    .orderBy(asc(verses.id));
}

export async function listTopicsWithVerses() {
  const database = await open();
  const topicRows = await database.select().from(topics).orderBy(asc(topics.id));
  const verseRows = await database
    .select({
      topicId: verseTopics.topicId,
      id: verses.id,
      reference: verses.reference,
      text: verses.text,
      translation: verses.translation,
    })
    .from(verseTopics)
    .innerJoin(verses, eq(verses.id, verseTopics.verseId))
    .orderBy(asc(verses.id));

  const byTopic = new Map<number, typeof verseRows>();
  for (const verse of verseRows) {
    const list = byTopic.get(verse.topicId) ?? [];
    list.push(verse);
    byTopic.set(verse.topicId, list);
  }

  return topicRows.map((topic) => ({
    ...topic,
    verses: (byTopic.get(topic.id) ?? []).map((verse) => ({
      id: verse.id,
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    })),
  }));
}

export async function searchLibrary(query: string) {
  const database = await open();
  const pattern = `%${query.trim()}%`;
  const [prayerRows, verseRows] = await Promise.all([
    database
      .select()
      .from(prayers)
      .where(
        or(
          like(prayers.title, pattern),
          like(prayers.author, pattern),
          like(prayers.body, pattern),
          like(prayers.scriptureReference, pattern),
          like(prayers.notes, pattern),
        ),
      )
      .orderBy(asc(prayers.id))
      .limit(40),
    database
      .select()
      .from(verses)
      .where(or(like(verses.reference, pattern), like(verses.text, pattern)))
      .orderBy(asc(verses.id))
      .limit(40),
  ]);

  const topicMap = await topicsForPrayers(
    database,
    prayerRows.map((row) => row.id),
  );
  const verseTopicMap = await topicsForVerses(
    database,
    verseRows.map((row) => row.id),
  );

  return {
    prayers: prayerRows.map((row) => ({
      ...row,
      topics: topicMap.get(row.id) ?? [],
    })),
    verses: verseRows.map((row) => ({
      ...row,
      topics: verseTopicMap.get(row.id) ?? [],
    })),
  };
}

async function topicsForPrayers(
  database: ReturnType<typeof getDatabase>["database"],
  ids: number[],
) {
  const map = new Map<number, TopicSummary[]>();
  if (ids.length === 0) return map;
  const rows = await database
    .select({
      prayerId: prayerTopics.prayerId,
      id: topics.id,
      slug: topics.slug,
      name: topics.name,
      description: topics.description,
    })
    .from(prayerTopics)
    .innerJoin(topics, eq(topics.id, prayerTopics.topicId))
    .where(inArray(prayerTopics.prayerId, ids))
    .orderBy(asc(topics.id));
  for (const row of rows) {
    const list = map.get(row.prayerId) ?? [];
    list.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
    });
    map.set(row.prayerId, list);
  }
  return map;
}

async function topicsForVerses(
  database: ReturnType<typeof getDatabase>["database"],
  ids: number[],
) {
  const map = new Map<number, TopicSummary[]>();
  if (ids.length === 0) return map;
  const rows = await database
    .select({
      verseId: verseTopics.verseId,
      id: topics.id,
      slug: topics.slug,
      name: topics.name,
      description: topics.description,
    })
    .from(verseTopics)
    .innerJoin(topics, eq(topics.id, verseTopics.topicId))
    .where(and(inArray(verseTopics.verseId, ids)))
    .orderBy(asc(topics.id));
  for (const row of rows) {
    const list = map.get(row.verseId) ?? [];
    list.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
    });
    map.set(row.verseId, list);
  }
  return map;
}
