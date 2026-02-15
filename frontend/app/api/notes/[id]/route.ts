import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { Sentiment } from "@/lib/types";

const allowedSentiment: Sentiment[] = ["Bullish", "Bearish", "Neutral"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const dataPoint = String(body.dataPoint ?? "").trim();
  const actualValue = String(body.actualValue ?? "").trim();
  const expectedValue = String(body.expectedValue ?? "").trim();
  const observedOn = String(body.observedOn ?? "").trim();
  const sentiment = String(body.sentiment ?? "").trim() as Sentiment;
  const commentary = String(body.commentary ?? "").trim();

  if (!dataPoint || !actualValue || !expectedValue || !observedOn || !commentary) {
    return NextResponse.json({ message: "All note fields are required" }, { status: 400 });
  }

  if (!allowedSentiment.includes(sentiment)) {
    return NextResponse.json({ message: "Invalid sentiment" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.run(
    `UPDATE notes
    SET data_point = ?, actual_value = ?, expected_value = ?, observed_on = ?, sentiment = ?, commentary = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [dataPoint, actualValue, expectedValue, observedOn, sentiment, commentary, Number(params.id)],
  );

  if (result.changes === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  const updated = await db.get(
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
    [Number(params.id)],
  );

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const db = await getDb();
  const result = await db.run("DELETE FROM notes WHERE id = ?", [Number(params.id)]);

  if (result.changes === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
