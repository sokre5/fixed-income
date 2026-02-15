import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { NotePayload, Sentiment } from "@/lib/types";

const allowedSentiment: Sentiment[] = ["Bullish", "Bearish", "Neutral"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sentiment = searchParams.get("sentiment");
  const instrumentId = searchParams.get("instrumentId");

  const whereParts: string[] = [];
  const params: Array<string | number> = [];

  if (sentiment && allowedSentiment.includes(sentiment as Sentiment)) {
    whereParts.push("n.sentiment = ?");
    params.push(sentiment);
  }

  if (instrumentId) {
    whereParts.push("n.instrument_id = ?");
    params.push(Number(instrumentId));
  }

  const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

  const db = await getDb();
  const notes = await db.all(
    `SELECT
      n.id,
      n.instrument_id AS instrumentId,
      i.name AS instrumentName,
      n.data_point AS dataPoint,
      n.actual_value AS actualValue,
      n.expected_value AS expectedValue,
      n.observed_on AS observedOn,
      n.sentiment,
      n.commentary,
      n.created_at AS createdAt
    FROM notes n
    INNER JOIN instruments i ON i.id = n.instrument_id
    ${whereSql}
    ORDER BY n.observed_on DESC, n.id DESC`,
    params,
  );

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = (await req.json()) as NotePayload;

  const instrumentName = String(body.instrumentName ?? "").trim();
  const dataPoint = String(body.dataPoint ?? "").trim();
  const actualValue = String(body.actualValue ?? "").trim();
  const expectedValue = String(body.expectedValue ?? "").trim();
  const observedOn = String(body.observedOn ?? "").trim();
  const sentiment = String(body.sentiment ?? "").trim() as Sentiment;
  const commentary = String(body.commentary ?? "").trim();

  if (!instrumentName || !dataPoint || !actualValue || !expectedValue || !observedOn || !commentary) {
    return NextResponse.json({ message: "All manual entry fields are required" }, { status: 400 });
  }

  if (!allowedSentiment.includes(sentiment)) {
    return NextResponse.json({ message: "Invalid sentiment" }, { status: 400 });
  }

  const db = await getDb();
  await db.run(
    `INSERT INTO instruments (name, updated_at)
      VALUES (?, CURRENT_TIMESTAMP)
      ON CONFLICT(name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
    [instrumentName],
  );

  const instrument = await db.get<{ id: number }>("SELECT id FROM instruments WHERE name = ?", [instrumentName]);

  if (!instrument) {
    return NextResponse.json({ message: "Instrument creation failed" }, { status: 500 });
  }

  const insertResult = await db.run(
    `INSERT INTO notes (instrument_id, data_point, actual_value, expected_value, observed_on, sentiment, commentary, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [instrument.id, dataPoint, actualValue, expectedValue, observedOn, sentiment, commentary],
  );

  const created = await db.get(
    `SELECT
      n.id,
      n.instrument_id AS instrumentId,
      i.name AS instrumentName,
      n.data_point AS dataPoint,
      n.actual_value AS actualValue,
      n.expected_value AS expectedValue,
      n.observed_on AS observedOn,
      n.sentiment,
      n.commentary,
      n.created_at AS createdAt
    FROM notes n
    INNER JOIN instruments i ON i.id = n.instrument_id
    WHERE n.id = ?`,
    [insertResult.lastID],
  );

  return NextResponse.json(created, { status: 201 });
}
