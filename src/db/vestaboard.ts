import { and, asc, eq, inArray } from "drizzle-orm";
import { ensureDatabase } from "./ensure";
import { getDatabase } from "./client";
import { topics, verseTopics, verses } from "./schema";
import { presentScripture } from "@/lib/present-scripture";
import { boardSize, formatVestaboard } from "@/lib/vestaboard";

export type VestaboardMessage = {
  reference: string;
  translation: string;
  topics: string[];
  text: string;
  characters: number[][];
};

type PickInput = {
  topic?: string;
  reference?: string;
  size?: string;
  random?: () => number;
};

export async function pickVestaboardMessage(
  input: PickInput = {},
): Promise<{ ok: true; message: VestaboardMessage } | { ok: false; error: string }> {
  await ensureDatabase();
  const database = getDatabase().database;
  const topic = input.topic?.trim();
  const reference = input.reference?.trim();

  const tagged = await database
    .select({ id: verses.id })
    .from(verses)
    .innerJoin(verseTopics, eq(verseTopics.verseId, verses.id))
    .innerJoin(topics, eq(topics.id, verseTopics.topicId))
    .where(eq(topics.slug, "vestaboard"))
    .orderBy(asc(verses.id));

  let ids = tagged.map((row) => row.id);
  if (ids.length === 0) {
    return { ok: false, error: "No verses are tagged for the Vestaboard." };
  }

  if (topic) {
    const also = await database
      .select({ id: verses.id })
      .from(verses)
      .innerJoin(verseTopics, eq(verseTopics.verseId, verses.id))
      .innerJoin(topics, eq(topics.id, verseTopics.topicId))
      .where(and(inArray(verses.id, ids), eq(topics.slug, topic.toLowerCase())));
    const allowed = new Set(also.map((row) => row.id));
    ids = ids.filter((id) => allowed.has(id));
    if (ids.length === 0) {
      return {
        ok: false,
        error: reference
          ? "That reference is not a Vestaboard verse with that topic."
          : "No Vestaboard verses are also tagged with that topic.",
      };
    }
  }

  const rows = await database
    .select()
    .from(verses)
    .where(inArray(verses.id, ids))
    .orderBy(asc(verses.id));
  const matches = reference
    ? rows.filter((row) => row.reference.trim().toLowerCase() === reference.toLowerCase())
    : rows;
  if (matches.length === 0) {
    return { ok: false, error: "That reference is not tagged for the Vestaboard." };
  }

  const random = input.random ?? Math.random;
  const index = Math.min(matches.length - 1, Math.max(0, Math.floor(random() * matches.length)));
  const verse = matches[index];
  if (!verse) return { ok: false, error: "No verses are tagged for the Vestaboard." };

  const topicRows = await database
    .select({ slug: topics.slug })
    .from(verseTopics)
    .innerJoin(topics, eq(topics.id, verseTopics.topicId))
    .where(eq(verseTopics.verseId, verse.id))
    .orderBy(asc(topics.slug));

  const [shown] = await presentScripture([
    {
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
      quotable: true,
    },
  ]);
  const fromEsv = shown?.fromEsv === true && Boolean(shown.text.trim());
  const curated = verse.vestaboardText?.trim() ?? "";
  const body = fromEsv && shown ? shown.text : curated || verse.text;
  const translation = fromEsv ? "ESV" : verse.translation;
  if (!body.trim()) {
    return { ok: false, error: "The passage could not be loaded." };
  }

  const { rows: boardRows, columns } = boardSize(input.size);
  const layout = formatVestaboard({
    reference: verse.reference,
    body,
    translation,
    rows: boardRows,
    columns,
  });

  return {
    ok: true,
    message: {
      reference: verse.reference,
      translation,
      topics: topicRows.map((row) => row.slug),
      text: layout.text,
      characters: layout.characters,
    },
  };
}
