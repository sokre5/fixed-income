import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { NotePayload, Sentiment } from "@/lib/types";

const allowedSentiment: Sentiment[] = ["Bullish", "Bearish", "Neutral"];

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as NotePayload;

  const instrumentName = String(body.instrumentName ?? "").trim();
  const dataPoint = String(body.dataPoint ?? "").trim();
  const actualValue = String(body.actualValue ?? "").trim();
  const expectedValue = String(body.expectedValue ?? "").trim();
  const observedOn = String(body.observedOn ?? "").trim();
  const sentiment = String(body.sentiment ?? "").trim() as Sentiment;
  const commentary = String(body.commentary ?? "").trim();

  if (!instrumentName || !dataPoint || !actualValue || !expectedValue || !observedOn || !commentary) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  if (!allowedSentiment.includes(sentiment)) {
    return NextResponse.json({ message: "Invalid sentiment" }, { status: 400 });
  }

  const db = getDb();

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
  if (!instrumentId) {
    return NextResponse.json({ message: "Instrument creation failed" }, { status: 500 });
  }

  const updateResult = await db.execute({
    sql: `UPDATE notes
          SET instrument_id = ?, data_point = ?, actual_value = ?, expected_value = ?,
              observed_on = ?, sentiment = ?, commentary = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [instrumentId, dataPoint, actualValue, expectedValue, observedOn, sentiment, commentary, id],
  });

  if (updateResult.rowsAffected === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  const updated = await db.execute({
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
    args: [id],
  });

  return NextResponse.json(updated.rows[0]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: "DELETE FROM notes WHERE id = ?",
    args: [id],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
