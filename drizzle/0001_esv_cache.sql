CREATE TABLE IF NOT EXISTS esv_cache (
  reference_key TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  verse_count INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL
);
