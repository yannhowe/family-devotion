import { eq } from "drizzle-orm";
import { ensureDatabase } from "@/db/ensure";
import { getDatabase } from "@/db/client";
import { esvCache } from "@/db/schema";
import {
  admitPassage,
  ESV_CACHE_MAX_AGE_MS,
  esvApiKey,
  fetchEsvPassage,
  normalizeReference,
  type EsvFetchOptions,
  type EsvPassage,
} from "@/lib/esv-api";

export type StoredEsv = EsvPassage & { referenceKey: string };

type RememberResult =
  | { ok: true; passage: StoredEsv }
  | { ok: false; reason: "failed" | "limited" };

export async function resolveEsvTexts(
  references: string[],
  options: EsvFetchOptions & { now?: number } = {},
) {
  const unique = [...new Set(references.map(normalizeReference).filter(Boolean))];
  const found = new Map<string, StoredEsv>();
  if (!(options.apiKey || esvApiKey()) || unique.length === 0) return found;

  await ensureDatabase();
  const database = getDatabase().database;
  const now = options.now ?? Date.now();
  const rows = unique.length
    ? await database.select().from(esvCache)
    : [];
  const byKey = new Map(rows.map((row) => [row.referenceKey, row]));

  for (const referenceKey of unique) {
    const cached = byKey.get(referenceKey);
    const fresh = cached ? now - cached.fetchedAt.getTime() < ESV_CACHE_MAX_AGE_MS : false;
    if (cached && fresh) {
      found.set(referenceKey, toStored(cached.referenceKey, cached.text, cached.verseCount, cached.bookId));
      continue;
    }

    const original = references.find((reference) => normalizeReference(reference) === referenceKey) ?? referenceKey;
    const fetched = await fetchEsvPassage(original, options);
    if (!fetched) {
      if (cached) {
        found.set(referenceKey, toStored(cached.referenceKey, cached.text, cached.verseCount, cached.bookId));
      }
      continue;
    }

    const saved = await rememberPassage(referenceKey, fetched, now);
    if (saved.ok) {
      found.set(referenceKey, saved.passage);
    } else if (cached) {
      found.set(referenceKey, toStored(cached.referenceKey, cached.text, cached.verseCount, cached.bookId));
    }
  }

  return found;
}

export async function rememberEsvReference(
  reference: string,
  options: EsvFetchOptions & { now?: number } = {},
): Promise<RememberResult> {
  if (!esvApiKey() && !options.apiKey) return { ok: false, reason: "failed" };
  const fetched = await fetchEsvPassage(reference, options);
  if (!fetched) return { ok: false, reason: "failed" };
  await ensureDatabase();
  return rememberPassage(normalizeReference(reference), fetched, options.now ?? Date.now());
}

async function rememberPassage(
  referenceKey: string,
  passage: EsvPassage,
  now: number,
): Promise<RememberResult> {
  const database = getDatabase().database;
  const rows = await database.select().from(esvCache);
  const existing = rows.find((row) => row.referenceKey === referenceKey);
  const total = rows.reduce((sum, row) => sum + row.verseCount, 0) - (existing?.verseCount ?? 0);
  const byBook = new Map<number, number>();
  for (const row of rows) {
    if (row.referenceKey === referenceKey) continue;
    byBook.set(row.bookId, (byBook.get(row.bookId) ?? 0) + row.verseCount);
  }
  if (!admitPassage({ total, byBook }, passage)) return { ok: false, reason: "limited" };

  const fetchedAt = new Date(now);
  if (existing) {
    await database
      .update(esvCache)
      .set({
        text: passage.text,
        verseCount: passage.verseCount,
        bookId: passage.bookId,
        fetchedAt,
      })
      .where(eq(esvCache.referenceKey, referenceKey));
  } else {
    await database.insert(esvCache).values({
      referenceKey,
      text: passage.text,
      verseCount: passage.verseCount,
      bookId: passage.bookId,
      fetchedAt,
    });
  }

  return { ok: true, passage: toStored(referenceKey, passage.text, passage.verseCount, passage.bookId) };
}

function toStored(referenceKey: string, text: string, verseCount: number, bookId: number): StoredEsv {
  return { referenceKey, text, verseCount, bookId };
}
