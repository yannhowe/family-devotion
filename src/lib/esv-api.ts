export const ESV_API_URL = "https://api.esv.org/v3/passage/text/";
export const ESV_SITE_URL = "https://www.esv.org/";
export const MAX_ESV_VERSES = 500;
export const ESV_CACHE_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export const ESV_COPYRIGHT_NOTICE = [
  "Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. The ESV text may not be quoted in any publication made available to the public by a Creative Commons license. The ESV may not be translated into any other language.",
  "Users may not copy or download more than 500 verses of the ESV Bible or more than one half of any book of the ESV Bible.",
].join(" ");

// Protestant verse totals. Index 0 is unused; index 1 is Genesis through 66, Revelation.
export const BOOK_VERSE_COUNTS = [
  0, 1533, 1213, 859, 1288, 959, 658, 618, 85, 810, 695, 816, 719, 942, 822, 280,
  406, 167, 1070, 2461, 915, 222, 117, 1292, 1364, 154, 1273, 357, 197, 73, 146,
  21, 48, 105, 47, 56, 53, 38, 211, 55, 1071, 678, 1151, 879, 1007, 433, 437, 257,
  149, 155, 104, 95, 89, 47, 113, 83, 46, 25, 303, 108, 105, 61, 105, 13, 14, 25,
  404,
];

export type EsvPassage = {
  text: string;
  verseCount: number;
  bookId: number;
};

export type EsvFetchOptions = {
  fetch?: typeof fetch;
  apiKey?: string;
  timeoutMs?: number;
};

export function esvApiKey() {
  const key = process.env.ESV_API_KEY?.trim();
  return key || undefined;
}

export function halfBookLimit(bookId: number) {
  const total = BOOK_VERSE_COUNTS[bookId] ?? 0;
  if (total <= 0) return 0;
  return Math.floor(total / 2);
}

export function normalizeReference(reference: string) {
  return reference.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePassageText(raw: string) {
  return raw.replace(/\s+/g, " ").trim();
}

export function measurePassage(parsed: unknown): { verseCount: number; bookId: number } | null {
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  let bookId: number | null = null;
  let verseCount = 0;
  for (const range of parsed) {
    if (!Array.isArray(range) || range.length < 2) return null;
    const start = decodeVerseId(range[0]);
    const end = decodeVerseId(range[1]);
    if (!start || !end || start.book !== end.book || start.chapter !== end.chapter) return null;
    if (bookId === null) bookId = start.book;
    if (bookId !== start.book || end.verse < start.verse) return null;
    verseCount += end.verse - start.verse + 1;
  }
  if (bookId === null || verseCount <= 0) return null;
  return { verseCount, bookId };
}

export function admitPassage(
  state: { total: number; byBook: ReadonlyMap<number, number> },
  passage: { verseCount: number; bookId: number },
) {
  const limit = halfBookLimit(passage.bookId);
  const usedInBook = state.byBook.get(passage.bookId) ?? 0;
  if (limit <= 0 || passage.verseCount <= 0) return false;
  if (passage.verseCount > MAX_ESV_VERSES || passage.verseCount > limit) return false;
  if (state.total + passage.verseCount > MAX_ESV_VERSES) return false;
  if (usedInBook + passage.verseCount > limit) return false;
  return true;
}

export async function fetchEsvPassage(
  reference: string,
  options: EsvFetchOptions = {},
): Promise<EsvPassage | null> {
  const apiKey = options.apiKey ?? esvApiKey();
  const query = reference.trim();
  if (!apiKey || !query) return null;

  const fetchImpl = options.fetch ?? fetch;
  const url = new URL(ESV_API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("include-passage-references", "false");
  url.searchParams.set("include-verse-numbers", "false");
  url.searchParams.set("include-first-verse-numbers", "false");
  url.searchParams.set("include-footnotes", "false");
  url.searchParams.set("include-footnote-body", "false");
  url.searchParams.set("include-headings", "false");
  url.searchParams.set("include-short-copyright", "false");
  url.searchParams.set("include-copyright", "false");
  url.searchParams.set("indent-paragraphs", "0");
  url.searchParams.set("indent-poetry", "false");

  const timeoutMs = options.timeoutMs ?? 8000;
  try {
    const response = await fetchImpl(url, {
      headers: { Authorization: `Token ${apiKey}` },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return parseEsvResponse(body);
  } catch {
    return null;
  }
}

export function parseEsvResponse(body: unknown): EsvPassage | null {
  if (!body || typeof body !== "object") return null;
  const passages = "passages" in body ? body.passages : null;
  const parsed = "parsed" in body ? body.parsed : null;
  const raw = Array.isArray(passages) ? passages[0] : null;
  if (typeof raw !== "string") return null;
  const text = normalizePassageText(raw);
  const measured = measurePassage(parsed);
  if (!text || !measured) return null;
  return { text, verseCount: measured.verseCount, bookId: measured.bookId };
}

function decodeVerseId(value: unknown) {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  const digits = String(id).padStart(8, "0");
  const book = Number(digits.slice(0, 2));
  const chapter = Number(digits.slice(2, 5));
  const verse = Number(digits.slice(5, 8));
  if (book < 1 || book > 66 || chapter < 1 || verse < 1) return null;
  return { book, chapter, verse };
}
