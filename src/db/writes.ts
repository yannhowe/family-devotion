import { eq } from "drizzle-orm";
import { ensureDatabase } from "./ensure";
import { getDatabase, type Database } from "./client";

type Query = Parameters<Parameters<Database["transaction"]>[0]>[0];
import { prayerTopics, prayers, topics, verseTopics, verses } from "./schema";
import { normalizeTranslation } from "@/lib/format";
import { slugify } from "@/lib/slug";

export type WriteResult =
  | { ok: true; id: number; topicSlug?: string }
  | { ok: false; error: string };

type PrayerInput = {
  title: string;
  author: string;
  body: string;
  scriptureReference: string;
  notes: string;
  topicIds: number[];
  newTopicName: string;
};

type VerseInput = {
  reference: string;
  text: string;
  translation: string;
  topicIds: number[];
  newTopicName: string;
};

export async function createPrayer(input: PrayerInput): Promise<WriteResult> {
  const title = cleanLine(input.title, 200);
  const author = cleanLine(input.author, 120);
  const body = cleanText(input.body, 20000);
  const scriptureReference = cleanLine(input.scriptureReference, 200);
  const notes = cleanText(input.notes, 2000);
  const newTopicName = cleanLine(input.newTopicName, 80);

  if (!title) return { ok: false, error: "A prayer needs a title." };
  if (!author) return { ok: false, error: "A prayer needs an author." };
  if (!body) return { ok: false, error: "A prayer needs its words." };

  try {
    await ensureDatabase();
    const database = getDatabase().database;
    return await database.transaction(async (tx) => {
      const topicIds = await collectTopicIds(tx, input.topicIds, newTopicName);
      const inserted = await tx
        .insert(prayers)
        .values({
          title,
          author,
          body,
          scriptureReference: scriptureReference || null,
          notes: notes || null,
          createdAt: new Date(),
        })
        .returning({ id: prayers.id });
      const id = inserted[0]?.id;
      if (!id) return { ok: false, error: "The prayer could not be saved." };
      if (topicIds.length > 0) {
        await tx
          .insert(prayerTopics)
          .values(topicIds.map((topicId) => ({ prayerId: id, topicId })))
          .onConflictDoNothing();
      }
      return { ok: true as const, id };
    });
  } catch (error) {
    if (isUniqueConstraint(error)) {
      return {
        ok: false,
        error: "A prayer with that scripture reference is already in this library.",
      };
    }
    throw error;
  }
}

export async function createVerse(input: VerseInput): Promise<WriteResult> {
  const reference = cleanLine(input.reference, 200);
  const text = cleanText(input.text, 8000);
  const translation = normalizeTranslation(input.translation || "WEB");
  const newTopicName = cleanLine(input.newTopicName, 80);

  if (!reference) {
    return {
      ok: false,
      error: "A verse needs a reference, such as Philippians 4:6-7.",
    };
  }
  if (!text) return { ok: false, error: "A verse needs its text." };
  if (!translation) return { ok: false, error: "Name the translation, such as WEB." };

  try {
    await ensureDatabase();
    const database = getDatabase().database;
    return await database.transaction(async (tx) => {
      const topicIds = await collectTopicIds(tx, input.topicIds, newTopicName);
      if (topicIds.length === 0) {
        return {
          ok: false,
          error: "Choose a topic, or type a new one, so the verse can be found.",
        };
      }
      const inserted = await tx
        .insert(verses)
        .values({
          reference,
          text,
          translation,
          createdAt: new Date(),
        })
        .returning({ id: verses.id });
      const id = inserted[0]?.id;
      if (!id) return { ok: false, error: "The verse could not be saved." };
      await tx
        .insert(verseTopics)
        .values(topicIds.map((topicId) => ({ verseId: id, topicId })))
        .onConflictDoNothing();
      const topic = await tx
        .select({ slug: topics.slug })
        .from(topics)
        .where(eq(topics.id, topicIds[0] as number))
        .limit(1);
      return { ok: true as const, id, topicSlug: topic[0]?.slug };
    });
  } catch (error) {
    if (isUniqueConstraint(error)) {
      return {
        ok: false,
        error: "That reference is already saved in this translation.",
      };
    }
    throw error;
  }
}

async function collectTopicIds(
  database: Query,
  topicIds: number[],
  newTopicName: string,
) {
  const ids = [...new Set(topicIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (!newTopicName) return ids;
  const topicId = await topicIdForName(database, newTopicName);
  if (!ids.includes(topicId)) ids.push(topicId);
  return ids;
}

async function topicIdForName(database: Query, name: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await database
      .select()
      .from(topics)
      .where(eq(topics.slug, slug))
      .limit(1);
    const topic = existing[0];
    if (!topic) break;
    if (topic.name.toLowerCase() === name.toLowerCase()) return topic.id;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  const inserted = await database
    .insert(topics)
    .values({ slug, name, description: null })
    .returning({ id: topics.id });
  const id = inserted[0]?.id;
  if (!id) throw new Error("The topic could not be saved.");
  return id;
}

function cleanLine(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanText(value: string, max: number) {
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

function isUniqueConstraint(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  if (/UNIQUE|SQLITE_CONSTRAINT/i.test(`${code} ${message}`)) return true;
  if ("cause" in error) return isUniqueConstraint(error.cause);
  return false;
}
