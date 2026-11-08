import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "./client";
import { ensureDatabase, resetDatabaseForTests } from "./ensure";
import { prayers, topics, verseTopics, verses } from "./schema";
import { seedPrayers, seedTopics, seedVerses } from "./seed-data";
import { presentVerses } from "@/lib/present-scripture";
import { createPrayer, createVerse } from "./writes";

const requiredReferences = [
  "Ephesians 1:15-23",
  "Ephesians 3:14-21",
  "Philippians 1:9-11",
  "Colossians 1:9-14",
  "2 Thessalonians 1:11-12",
];

test("seed is idempotent and can accept one added prayer", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "family-devotion-"));
  const previous = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    VERCEL: process.env.VERCEL,
  };
  process.env.DATABASE_URL = `file:${path.join(directory, "devotion.db")}`;
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  delete process.env.VERCEL;
  resetDatabaseForTests();
  closeDatabase();

  try {
    await ensureDatabase();
    await ensureDatabase();
    const database = getDatabase().database;
    const prayerRows = await database.select().from(prayers);
    const verseRows = await database.select().from(verses);
    const topicRows = await database.select().from(topics);
    const linkRows = await database.select().from(verseTopics);

    assert.equal(prayerRows.length, seedPrayers.length);
    assert.equal(verseRows.length, seedVerses.length);
    assert.equal(topicRows.length, seedTopics.length);
    assert.ok(linkRows.length >= seedVerses.length);

    const references = new Set(prayerRows.map((row) => row.scriptureReference));
    for (const reference of requiredReferences) {
      assert.ok(references.has(reference), reference);
    }
    assert.ok(prayerRows.every((row) => row.author === "Paul"));
    assert.ok(verseRows.every((row) => row.translation === "WEB"));

    const ephesians = prayerRows.find(
      (row) => row.scriptureReference === "Ephesians 1:15-23",
    );
    assert.ok(ephesians?.body.includes("don’t cease to give thanks for you"));

    const love = topicRows.find((row) => row.slug === "love");
    assert.ok(love);
    const corinthians = verseRows.find(
      (row) => row.reference === "1 Corinthians 13:4-7",
    );
    assert.ok(corinthians?.text.includes("Love is patient and is kind"));

    await ensureDatabase();
    const after = await database.select().from(prayers);
    assert.equal(after.length, prayerRows.length);

    const added = await createPrayer({
      title: "A family prayer",
      author: "Our family",
      body: "Lord, teach us to pray according to your will.",
      scriptureReference: "",
      notes: "",
      topicIds: [love.id],
      newTopicName: "",
    });
    assert.equal(added.ok, true);

    const duplicate = await createVerse({
      reference: "James 1:5",
      text: "Another copy",
      translation: "WEB",
      topicIds: [love.id],
      newTopicName: "",
    });
    assert.equal(duplicate.ok, false);

    const freshTopic = await createVerse({
      reference: "A family note",
      text: "A sentence saved to prove a new topic can be added.",
      translation: "web",
      topicIds: [],
      newTopicName: "Justice",
    });
    assert.equal(freshTopic.ok, true);
    if (freshTopic.ok) assert.equal(freshTopic.topicSlug, "justice");

    const saved = await database
      .select()
      .from(verses)
      .where(eq(verses.reference, "A family note"));
    assert.equal(saved[0]?.translation, "WEB");

    const james = await database
      .select()
      .from(verses)
      .where(eq(verses.reference, "James 1:5"));
    const webShown = await presentVerses(james);
    assert.equal(webShown[0]?.translation, "WEB");
    assert.equal(webShown[0]?.text, james[0]?.text);

    const esvText = "The mock passage returns these exact words.";
    const previousFetch = globalThis.fetch;
    const previousEsvKey = process.env.ESV_API_KEY;
    process.env.ESV_API_KEY = "test-key";
    let fetches = 0;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      fetches += 1;
      const url = new URL(String(input));
      assert.equal(new URL(url).origin + url.pathname, "https://api.esv.org/v3/passage/text/");
      if (url.searchParams.get("q") === "John 11:35") {
        return Response.json({
          parsed: [[43011035, 43011035]],
          passages: [`  ${esvText}  `],
        });
      }
      return new Response("no", { status: 503 });
    }) as typeof fetch;

    try {
      const before = (await database.select().from(verses)).length;
      const failed = await createVerse({
        reference: "John 11:36",
        text: "",
        translation: "WEB",
        topicIds: [love.id],
        newTopicName: "",
      });
      assert.equal(failed.ok, false);
      assert.equal((await database.select().from(verses)).length, before);

      const addedEsv = await createVerse({
        reference: "John 11:35",
        text: "",
        translation: "WEB",
        topicIds: [love.id],
        newTopicName: "",
      });
      assert.equal(addedEsv.ok, true);
      const row = await database
        .select()
        .from(verses)
        .where(eq(verses.reference, "John 11:35"));
      assert.equal(row[0]?.translation, "ESV");
      assert.equal(row[0]?.text, esvText);
      const shown = await presentVerses(row);
      assert.equal(shown[0]?.text, esvText);
      assert.equal(shown[0]?.translation, "ESV");
      const fetchesAfterCreate = fetches;
      await presentVerses(row);
      assert.equal(fetches, fetchesAfterCreate);
      assert.equal(james[0]?.translation, "WEB");
    } finally {
      globalThis.fetch = previousFetch;
      if (previousEsvKey === undefined) delete process.env.ESV_API_KEY;
      else process.env.ESV_API_KEY = previousEsvKey;
    }
  } finally {
    closeDatabase();
    resetDatabaseForTests();
    if (previous.DATABASE_URL === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previous.DATABASE_URL;
    if (previous.TURSO_DATABASE_URL === undefined) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previous.TURSO_DATABASE_URL;
    if (previous.TURSO_AUTH_TOKEN === undefined) delete process.env.TURSO_AUTH_TOKEN;
    else process.env.TURSO_AUTH_TOKEN = previous.TURSO_AUTH_TOKEN;
    if (previous.VERCEL === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous.VERCEL;
    rmSync(directory, { recursive: true, force: true });
  }
});
