import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const result = await db.execute("SELECT id, name FROM instruments ORDER BY name ASC");
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ message: "Instrument name is required" }, { status: 400 });
  }

  const db = getDb();
  await db.execute({
    sql: `INSERT INTO instruments (name, updated_at)
          VALUES (?, CURRENT_TIMESTAMP)
          ON CONFLICT(name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
    args: [name],
  });

  const result = await db.execute({
    sql: "SELECT id, name FROM instruments WHERE name = ?",
    args: [name],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}
