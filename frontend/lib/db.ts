import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

export async function getDb(): Promise<Client> {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:data/journal.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    initPromise = initializeDb(client);
  }
  await initPromise;
  return client;
}

async function initializeDb(db: Client) {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS instruments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      instrument_id INTEGER NOT NULL,
      data_point TEXT NOT NULL,
      actual_value TEXT NOT NULL,
      expected_value TEXT NOT NULL,
      observed_on TEXT NOT NULL,
      sentiment TEXT NOT NULL CHECK (sentiment IN ('Bullish', 'Bearish', 'Neutral')),
      commentary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notes_instrument_id ON notes(instrument_id);
    CREATE INDEX IF NOT EXISTS idx_notes_sentiment ON notes(sentiment);
    CREATE INDEX IF NOT EXISTS idx_notes_observed_on ON notes(observed_on DESC);
    CREATE INDEX IF NOT EXISTS idx_study_notes_updated ON study_notes(updated_at DESC);
  `);
}
