import assert from "node:assert/strict";
import test from "node:test";
import {
  admitPassage,
  BOOK_VERSE_COUNTS,
  ESV_API_URL,
  ESV_COPYRIGHT_NOTICE,
  fetchEsvPassage,
  halfBookLimit,
  MAX_ESV_VERSES,
  measurePassage,
  parseEsvResponse,
} from "./esv-api";
import { applyEsvViews } from "./present-scripture";

const mockWords = "Alpha beta gamma remains exact.";

test("ESV requests use the official passage API and do not alter the text", async () => {
  const previousKey = process.env.ESV_API_KEY;
  process.env.ESV_API_KEY = "test-key-only";
  let seenUrl = "";
  let seenAuth = "";
  const fetchImpl: typeof fetch = async (input, init) => {
    seenUrl = String(input);
    seenAuth = new Headers(init?.headers).get("authorization") ?? "";
    return Response.json({
      query: "John 11:35",
      parsed: [[43011035, 43011035]],
      passages: [`  ${mockWords}  \n`],
    });
  };

  try {
    const passage = await fetchEsvPassage("John 11:35", { fetch: fetchImpl, timeoutMs: 1000 });
    const url = new URL(seenUrl);
    assert.equal(`${url.origin}${url.pathname}`, ESV_API_URL);
    assert.equal(url.searchParams.get("q"), "John 11:35");
    assert.equal(url.searchParams.get("include-headings"), "false");
    assert.equal(url.searchParams.get("include-footnotes"), "false");
    assert.equal(url.searchParams.get("include-verse-numbers"), "false");
    assert.equal(seenAuth, "Token test-key-only");
    assert.equal(passage?.text, mockWords);
    assert.equal(passage?.verseCount, 1);
    assert.equal(passage?.bookId, 43);
  } finally {
    if (previousKey === undefined) delete process.env.ESV_API_KEY;
    else process.env.ESV_API_KEY = previousKey;
  }
});

test("a missing key, a failed response, or a timeout does not invent text", async () => {
  const previousKey = process.env.ESV_API_KEY;
  delete process.env.ESV_API_KEY;
  let called = 0;
  const fetchImpl: typeof fetch = async () => {
    called += 1;
    return Response.json({});
  };
  assert.equal(await fetchEsvPassage("John 11:35", { fetch: fetchImpl }), null);
  assert.equal(called, 0);

  process.env.ESV_API_KEY = "test-key-only";
  const failed = await fetchEsvPassage("John 11:35", {
    fetch: async () => new Response("no", { status: 503 }),
  });
  assert.equal(failed, null);

  const timedOut = await fetchEsvPassage("John 11:35", {
    timeoutMs: 20,
    fetch: async (_input, init) => {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 1000);
        const abort = () => {
          clearTimeout(timer);
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        };
        if (init?.signal?.aborted) abort();
        else init?.signal?.addEventListener("abort", abort, { once: true });
      });
      return new Response("late");
    },
  });
  assert.equal(timedOut, null);

  assert.equal(parseEsvResponse({ passages: ["   "], parsed: [[43011035, 43011035]] }), null);
  assert.equal(measurePassage([[43011035, 43012001]]), null);

  if (previousKey === undefined) delete process.env.ESV_API_KEY;
  else process.env.ESV_API_KEY = previousKey;
});

test("storage and page limits stay within 500 verses and half a book", () => {
  assert.equal(BOOK_VERSE_COUNTS.reduce((sum, count) => sum + count, 0), 31102);
  assert.equal(halfBookLimit(31), 10);
  assert.equal(admitPassage({ total: 0, byBook: new Map() }, { verseCount: 11, bookId: 31 }), false);
  assert.equal(admitPassage({ total: 0, byBook: new Map() }, { verseCount: 10, bookId: 31 }), true);
  assert.equal(
    admitPassage({ total: MAX_ESV_VERSES - 5, byBook: new Map() }, { verseCount: 6, bookId: 43 }),
    false,
  );

  const items = [1, 2, 3].map((verse) => ({
    reference: `John 1:${verse}`,
    text: "Stored public-domain fallback.",
    translation: "WEB",
    quotable: true,
  }));
  const resolved = new Map([
    ["john 1:1", { text: "First exact esv words.", verseCount: 200, bookId: 43 }],
    ["john 1:2", { text: "Second exact esv words.", verseCount: 200, bookId: 43 }],
    ["john 1:3", { text: "Third exact esv words.", verseCount: 200, bookId: 43 }],
  ]);
  const shown = applyEsvViews(items, resolved, true);
  assert.equal(shown[0]?.text, "First exact esv words.");
  assert.equal(shown[0]?.translation, "ESV");
  assert.equal(shown[1]?.fromEsv, true);
  assert.equal(shown[2]?.fromEsv, false);
  assert.equal(shown[2]?.text, "Stored public-domain fallback.");

  const withoutKey = applyEsvViews(items, resolved, false);
  assert.equal(withoutKey[0]?.text, "Stored public-domain fallback.");
  assert.equal(withoutKey[0]?.fromEsv, false);
});

test("the Crossway copyright notice is the required form", () => {
  assert.match(ESV_COPYRIGHT_NOTICE, /Scripture quotations are from the ESV® Bible/);
  assert.match(ESV_COPYRIGHT_NOTICE, /© 2001 by Crossway/);
  assert.match(
    ESV_COPYRIGHT_NOTICE,
    /Users may not copy or download more than 500 verses of the ESV Bible or more than one half of any book of the ESV Bible/,
  );
});
