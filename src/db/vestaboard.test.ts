import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { eq } from "drizzle-orm";
import { closeDatabase, getDatabase } from "./client";
import { ensureDatabase, resetDatabaseForTests } from "./ensure";
import { topics, verseTopics, verses } from "./schema";
import { pickVestaboardMessage } from "./vestaboard";
import { FLAGSHIP_COLUMNS, FLAGSHIP_ROWS, VALID_VESTABOARD_CODES } from "../lib/vestaboard";

test("the Vestaboard API chooses only tagged verses", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "family-devotion-board-"));
  const previous = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    VERCEL: process.env.VERCEL,
    ESV_API_KEY: process.env.ESV_API_KEY,
  };
  process.env.DATABASE_URL = `file:${path.join(directory, "devotion.db")}`;
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  delete process.env.VERCEL;
  delete process.env.ESV_API_KEY;
  resetDatabaseForTests();
  closeDatabase();

  try {
    const none = await pickVestaboardMessage({ random: () => 0 });
    assert.equal(none.ok, false);
    if (!none.ok) assert.match(none.error, /tagged for the Vestaboard/);

    await ensureDatabase();
    await getDatabase().client.execute(
      "DELETE FROM schema_migrations WHERE id = '0003_vestaboard_reference'",
    );
    resetDatabaseForTests();
    await ensureDatabase();
    const database = getDatabase().database;
    const [boardTopic] = await database
      .select()
      .from(topics)
      .where(eq(topics.slug, "vestaboard"));
    const [thanks] = await database.select().from(topics).where(eq(topics.slug, "thanksgiving"));
    const [psalm] = await database
      .select()
      .from(verses)
      .where(eq(verses.reference, "Psalm 107:1"));
    assert.ok(boardTopic && thanks && psalm);
    await database.insert(verseTopics).values({ verseId: psalm.id, topicId: boardTopic.id });

    const chosen = await pickVestaboardMessage({ random: () => 0 });
    assert.equal(chosen.ok, true);
    if (!chosen.ok) return;
    assert.equal(chosen.message.reference, "Psalm 107:1");
    assert.equal(chosen.message.translation, "WEB");
    assert.ok(chosen.message.topics.includes("vestaboard"));
    assert.ok(chosen.message.topics.includes("thanksgiving"));
    assert.equal(chosen.message.characters.length, FLAGSHIP_ROWS);
    assert.ok(chosen.message.characters.every((row) => row.length === FLAGSHIP_COLUMNS));
    assert.ok(
      chosen.message.characters.flat().every((code) => VALID_VESTABOARD_CODES.has(code)),
    );
    assert.match(chosen.message.text, /GIVE THANKS TO YAHWEH/);

    const otherTopic = await pickVestaboardMessage({ topic: "love", random: () => 0 });
    assert.equal(otherTopic.ok, false);

    const sameTopic = await pickVestaboardMessage({ topic: "thanksgiving", random: () => 0 });
    assert.equal(sameTopic.ok, true);

    const missingReference = await pickVestaboardMessage({
      reference: "John 13:34-35",
      random: () => 0,
    });
    assert.equal(missingReference.ok, false);

    const byReference = await pickVestaboardMessage({
      reference: "psalm 107:1",
      random: () => 0,
    });
    assert.equal(byReference.ok, true);
    if (byReference.ok) assert.equal(byReference.message.reference, "Psalm 107:1");

    const inserted = await database
      .insert(verses)
      .values({
        reference: "Jeremiah 29:10-14",
        text: "Longer passage around the promise. For I know the plans I have for you, and the verses that follow it.",
        translation: "WEB",
        vestaboardText: "For I know the plans I have for you.",
        vestaboardReference: "Jeremiah 29:11",
        createdAt: new Date(),
      })
      .returning({ id: verses.id });
    const rangeId = inserted[0]?.id;
    assert.ok(rangeId);
    await database.insert(verseTopics).values({ verseId: rangeId, topicId: boardTopic.id });

    const previousFetch = globalThis.fetch;
    process.env.ESV_API_KEY = "dummy-token";
    globalThis.fetch = (async () =>
      Response.json({
        parsed: [[24029011, 24029011]],
        passages: ["COMPLETELY DIFFERENT ESV WORDING FOR THE WHOLE PASSAGE"],
      })) as typeof fetch;

    try {
      const subset = await pickVestaboardMessage({
        reference: "Jeremiah 29:10-14",
        random: () => 0,
      });
      assert.equal(subset.ok, true);
      if (subset.ok) {
        assert.equal(subset.message.reference, "Jeremiah 29:11");
        assert.equal(subset.message.text.split("\n")[0], "JER 29:11");
        assert.doesNotMatch(subset.message.text, /29:10-14/);
        assert.match(subset.message.text, /FOR I KNOW THE PLANS/);
        assert.match(subset.message.text, /HAVE FOR YOU/);
        assert.doesNotMatch(subset.message.text, /LONGER PASSAGE/);
        assert.doesNotMatch(subset.message.text, /COMPLETELY DIFFERENT/);
      }

      const byExcerpt = await pickVestaboardMessage({
        reference: "Jeremiah 29:11",
        random: () => 0,
      });
      assert.equal(byExcerpt.ok, true);
      if (byExcerpt.ok) assert.equal(byExcerpt.message.reference, "Jeremiah 29:11");
    } finally {
      globalThis.fetch = previousFetch;
      delete process.env.ESV_API_KEY;
    }
  } finally {
    closeDatabase();
    resetDatabaseForTests();
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
