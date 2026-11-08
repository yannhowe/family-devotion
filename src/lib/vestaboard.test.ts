import assert from "node:assert/strict";
import test from "node:test";
import { seedVerses, seedVestaboardText } from "../db/seed-data";
import {
  FLAGSHIP_COLUMNS,
  FLAGSHIP_ROWS,
  NOTE_COLUMNS,
  NOTE_ROWS,
  VALID_VESTABOARD_CODES,
  formatVestaboard,
  normalizeBoardText,
} from "./vestaboard";

test("a flagship message is always 6 by 22 valid character codes", () => {
  const layout = formatVestaboard({
    reference: "Psalm 107:1",
    body: "Give thanks to Yahweh, for he is good, for his loving kindness endures forever.",
    translation: "WEB",
  });

  assert.equal(layout.characters.length, FLAGSHIP_ROWS);
  assert.ok(layout.characters.every((row) => row.length === FLAGSHIP_COLUMNS));
  assert.ok(layout.characters.flat().every((code) => VALID_VESTABOARD_CODES.has(code)));
  assert.ok(layout.text.split("\n").length <= FLAGSHIP_ROWS);
  assert.ok(layout.text.split("\n").every((line) => line.length <= FLAGSHIP_COLUMNS));
  assert.match(layout.text, /PSALM 107:1/);
  assert.doesNotMatch(layout.text, /ESV/);
  assert.equal(layout.characters[0]?.[0], 16);
});

test("unsupported characters are replaced or dropped and the board does not overflow", () => {
  const normalized = normalizeBoardText("don’t—worry café");
  assert.equal(normalized, "DON'T-WORRY CAF");

  const layout = formatVestaboard({
    reference: "John 11:35",
    body: `don’t ${"Alpha ".repeat(80)}`,
    translation: "ESV",
  });
  const lines = layout.text.split("\n");
  assert.ok(lines.length <= FLAGSHIP_ROWS);
  assert.ok(lines.every((line) => line.length <= FLAGSHIP_COLUMNS));
  assert.match(layout.text, /JOHN 11:35 ESV/);
  assert.match(layout.text, /DON'T/);
  assert.equal(layout.characters.length, FLAGSHIP_ROWS);
});

test("a note-sized board is 3 by 15", () => {
  const layout = formatVestaboard({
    reference: "John 11:35",
    body: "Jesus wept.",
    translation: "WEB",
    rows: NOTE_ROWS,
    columns: NOTE_COLUMNS,
  });
  assert.equal(layout.characters.length, NOTE_ROWS);
  assert.ok(layout.characters.every((row) => row.length === NOTE_COLUMNS));
  assert.ok(layout.text.split("\n").every((line) => line.length <= NOTE_COLUMNS));
});

test("seed board copy is a contiguous excerpt of the public-domain verse", () => {
  for (const verse of seedVerses) {
    const short = seedVestaboardText[verse.reference];
    assert.ok(short, verse.reference);
    const collapsed = verse.text.replace(/\s+/g, " ").trim();
    assert.ok(collapsed.includes(short.replace(/\s+/g, " ").trim()), verse.reference);
  }
});
