<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Vestaboard shorts and references

Use this when Yann asks you to backfill Vestaboard fields on existing verses or to fill them for new content. These are library columns, not copy pasted into the board header.

Each `verses` row is one stored passage. Keep these fields separate:

- `reference`: the full stored passage, such as `Jeremiah 29:10-14`.
- `text`: the full passage text.
- `vestaboard_text`: the short version. This is the board body only. Do not put the citation in this field.
- `vestaboard_reference`: the citation for that short excerpt, and only when the excerpt is a proper subset of the full passage. Example: the row is `Jeremiah 29:10-14` and the short is only verse 11, so `vestaboard_reference` is `Jeremiah 29:11`. Leave it null or empty when the short is from the same single verse, or when the short covers the whole stored range. Live examples that stay empty: `1 Thessalonians 5:16-18` and `1 Peter 1:15-16`.

`GET /api/vestaboard` already applies that pairing in `pickVestaboardMessage` (`src/db/vestaboard.ts`):

- Header citation: `vestaboard_reference` when it is non-empty, otherwise `reference`.
- Body: `vestaboard_text` when it is non-empty, otherwise a fitted excerpt of the full passage. That fallback may use the ESV overlay from `presentScripture` when `ESV_API_KEY` is set.
- A filled `vestaboard_text` wins over the ESV overlay. Do not replace a stored excerpt with an auto-fit of the longer passage, or a subset citation will sit on the wrong words.

Short versions must be verbatim ESV excerpts, never paraphrases. Take a contiguous stretch of the ESV text and cut it so it fits a flagship Vestaboard: 6 rows by 22 columns. `formatVestaboard` in `src/lib/vestaboard.ts` builds the header from the stored citation plus `ESV` when the translation is ESV. It abbreviates the book name at format time (`1 Thessalonians` becomes `1 Thess`, `Psalm` becomes `Ps`, `John` stays `John`). Store full book names in `reference` and `vestaboard_reference`; do not store the abbreviation. The abbreviated header usually fits on one line, including ` ESV`. If it still wraps, it can take 2 lines. The body only gets the rows that remain, so judge fit against the abbreviated header, not the full book name. Prefer the memorable core of the passage. Do not invent wording. Unsupported characters are normalized or dropped by the formatter; still write the excerpt in normal ESV wording, not pre-encoded board lines.

The app loads ESV through the Crossway API when `ESV_API_KEY` is set. Do not put ESV text in public seed data (`src/db/seed-data.ts` or the committed migrations). Yann's live library shorts for the original seed verses (ids 1–16) are currently World English Bible excerpts. When he asks you to write new shorts, write ESV.

When backfilling or adding short info:

1. Write `vestaboard_text` as a verbatim ESV excerpt that fits under the header.
2. Compare that excerpt to the verse boundaries of the full passage.
3. If it is a proper subset, set `vestaboard_reference` to the tighter citation. Match the app's book-name style: `Psalm 100:4`, `1 Corinthians 15:22`, not `Psalms`.
4. If it is not a subset, leave `vestaboard_reference` empty so the board falls back to `reference`.
5. Do not put the reference string inside `vestaboard_text`.

Tag the verse with the `vestaboard` topic (`verse_topics`) when it should appear on the board. Do not remove Prayer, Love, Wisdom, Thanksgiving, or other existing topics.
