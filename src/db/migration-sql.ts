export const migrationSql = `
CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS verses_reference_translation_unique
  ON verses (reference, translation);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS verse_topics (
  verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (verse_id, topic_id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS prayers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  scripture_reference TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS prayers_scripture_reference_unique
  ON prayers (scripture_reference)
  WHERE scripture_reference IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS prayer_topics (
  prayer_id INTEGER NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (prayer_id, topic_id)
);
`;

export const esvCacheSql = `
CREATE TABLE IF NOT EXISTS esv_cache (
  reference_key TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  verse_count INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL
);
`;
