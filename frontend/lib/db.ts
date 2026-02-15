import fs from "node:fs/promises";
import path from "node:path";

import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";

let dbPromise: Promise<Database> | null = null;

const schemaSql = `
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

CREATE INDEX IF NOT EXISTS idx_notes_instrument_id ON notes(instrument_id);
CREATE INDEX IF NOT EXISTS idx_notes_sentiment ON notes(sentiment);
CREATE INDEX IF NOT EXISTS idx_notes_observed_on ON notes(observed_on DESC);

CREATE TABLE IF NOT EXISTS study_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_notes_updated ON study_notes(updated_at DESC);
`;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
}

async function initializeDb() {
  const dataDir = path.join(process.cwd(), "data");
  await fs.mkdir(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "journal.db");
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");
  await db.exec(schemaSql);

  const notesColumns = await db.all<{ name: string }[]>("PRAGMA table_info(notes)");
  const hasActualValue = notesColumns.some((column) => column.name === "actual_value");
  const hasExpectedValue = notesColumns.some((column) => column.name === "expected_value");
  const hasLegacyValueText = notesColumns.some((column) => column.name === "value_text");

  if (!hasActualValue) {
    await db.exec("ALTER TABLE notes ADD COLUMN actual_value TEXT");
  }

  if (!hasExpectedValue) {
    await db.exec("ALTER TABLE notes ADD COLUMN expected_value TEXT");
  }

  if (hasLegacyValueText) {
    await db.exec("UPDATE notes SET actual_value = COALESCE(actual_value, value_text)");
  }

  await db.exec("UPDATE notes SET expected_value = COALESCE(expected_value, '')");

  return db;
}
