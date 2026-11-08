import type { PrayerSummary } from "@/db/queries";
import { seedPrayers } from "@/db/seed-data";
import { admitPassage, esvApiKey, normalizeReference } from "@/lib/esv-api";
import { resolveEsvTexts } from "@/lib/esv-cache";

const seededReferences = new Set(seedPrayers.map((prayer) => prayer.scriptureReference));

export type ScriptureInput = {
  reference: string | null;
  text: string;
  translation: string | null;
  quotable: boolean;
};

export type ScriptureView = {
  text: string;
  translation: string | null;
  fromEsv: boolean;
  notice: string | null;
};

const UNAVAILABLE = "The ESV text could not be loaded.";
const PAGE_LIMIT = "This passage is not shown here so the page stays within the ESV quotation limit.";

export async function presentScripture(items: ScriptureInput[]): Promise<ScriptureView[]> {
  if (!esvApiKey()) return applyEsvViews(items, new Map(), false);

  const references = items.flatMap((item) =>
    item.quotable && item.reference ? [item.reference] : [],
  );
  try {
    return applyEsvViews(items, await resolveEsvTexts(references), true);
  } catch {
    return applyEsvViews(items, new Map(), true);
  }
}

export function applyEsvViews(
  items: ScriptureInput[],
  resolved: ReadonlyMap<string, { text: string; verseCount: number; bookId: number }>,
  enabled: boolean,
): ScriptureView[] {
  if (!enabled) return items.map(asStored);
  const page = { total: 0, byBook: new Map<number, number>() };
  return items.map((item) => {
    if (!item.quotable || !item.reference) return asStored(item);
    const hit = resolved.get(normalizeReference(item.reference));
    if (!hit) return missingEsv(item);
    if (!admitPassage(page, hit)) return overPageLimit(item);
    page.total += hit.verseCount;
    page.byBook.set(hit.bookId, (page.byBook.get(hit.bookId) ?? 0) + hit.verseCount);
    return {
      text: hit.text,
      translation: "ESV",
      fromEsv: true,
      notice: null,
    };
  });
}

function prayerInput(prayer: PrayerSummary): ScriptureInput {
  const quotable = Boolean(
    prayer.scriptureReference && seededReferences.has(prayer.scriptureReference),
  );
  return {
    reference: prayer.scriptureReference,
    text: prayer.body,
    translation: quotable ? "WEB" : null,
    quotable,
  };
}

export async function presentPrayers(prayers: PrayerSummary[]) {
  const views = await presentScripture(prayers.map(prayerInput));
  return prayers.map((prayer, index) => {
    const view = views[index];
    return {
      ...prayer,
      body: view?.fromEsv ? view.text : prayer.body,
      translation: view?.fromEsv ? "ESV" : view?.translation,
    };
  });
}

export async function presentSearchResults<
  T extends { reference: string; text: string; translation: string },
>(prayers: PrayerSummary[], verses: T[]) {
  const views = await presentScripture([
    ...prayers.map(prayerInput),
    ...verses.map(verseInput),
  ]);
  return {
    prayers: prayers.map((prayer, index) => {
      const view = views[index];
      return {
        ...prayer,
        body: view?.fromEsv ? view.text : prayer.body,
        translation: view?.fromEsv ? "ESV" : view?.translation,
      };
    }),
    verses: verses.map((verse, index) => {
      const view = views[prayers.length + index];
      return {
        ...verse,
        text: view?.fromEsv ? view.text : verse.text,
        translation: view?.fromEsv ? "ESV" : verse.translation,
        notice: view?.notice ?? null,
      };
    }),
  };
}

function verseInput(verse: { reference: string; text: string; translation: string }): ScriptureInput {
  return {
    reference: verse.reference,
    text: verse.text,
    translation: verse.translation,
    quotable: true,
  };
}

export async function presentVerses<T extends { reference: string; text: string; translation: string }>(
  verses: T[],
) {
  const views = await presentScripture(verses.map(verseInput));
  return verses.map((verse, index) => {
    const view = views[index];
    return {
      ...verse,
      text: view?.fromEsv ? view.text : verse.text,
      translation: view?.fromEsv ? "ESV" : verse.translation,
      notice: view?.notice ?? null,
    };
  });
}

function asStored(item: ScriptureInput): ScriptureView {
  return {
    text: item.text,
    translation: item.translation,
    fromEsv: false,
    notice: null,
  };
}

function missingEsv(item: ScriptureInput): ScriptureView {
  if ((item.translation ?? "").toUpperCase() === "ESV") {
    return { text: "", translation: "ESV", fromEsv: false, notice: UNAVAILABLE };
  }
  return asStored(item);
}

function overPageLimit(item: ScriptureInput): ScriptureView {
  if ((item.translation ?? "").toUpperCase() === "ESV") {
    return { text: "", translation: "ESV", fromEsv: false, notice: PAGE_LIMIT };
  }
  return asStored(item);
}
