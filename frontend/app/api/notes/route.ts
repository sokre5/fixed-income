import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { NotePayload, Sentiment } from "@/lib/types";

const allowedSentiment: Sentiment[] = ["Bullish", "Bearish", "Neutral"];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sentiment = searchParams.get("sentiment");
    const instrumentId = searchParams.get("instrumentId");

    const whereParts: string[] = [];
    const args: Array<string | number> = [];

    if (sentiment && allowedSentiment.includes(sentiment as Sentiment)) {
      whereParts.push("n.sentiment = ?");
      args.push(sentiment);
    }

    if (instrumentId) {
      whereParts.push("n.instrument_id = ?");
      args.push(Number(instrumentId));
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT
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
      args,
    });

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/notes error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    await db.execute({
      sql: `INSERT INTO instruments (name, updated_at)
            VALUES (?, CURRENT_TIMESTAMP)
            ON CONFLICT(name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
      args: [instrumentName],
    });

    const instrResult = await db.execute({
      sql: "SELECT id FROM instruments WHERE name = ?",
      args: [instrumentName],
    });

    const instrumentId = instrResult.rows[0]?.id;
    if (instrumentId == null) {
      return NextResponse.json({ message: "Instrument creation failed" }, { status: 500 });
    }

    const insertResult = await db.execute({
      sql: `INSERT INTO notes (instrument_id, data_point, actual_value, expected_value, observed_on, sentiment, commentary, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [instrumentId, dataPoint, actualValue, expectedValue, observedOn, sentiment, commentary],
    });

    const newId = insertResult.lastInsertRowid;
    if (newId == null) {
      return NextResponse.json({ message: "Insert failed" }, { status: 500 });
    }

    const created = await db.execute({
      sql: `SELECT
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
      args: [Number(newId)],
    });

    return NextResponse.json(created.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
