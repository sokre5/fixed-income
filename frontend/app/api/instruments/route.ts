import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const items = await db.all<{
    id: number;
    name: string;
  }[]>("SELECT id, name FROM instruments ORDER BY name ASC");

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ message: "Instrument name is required" }, { status: 400 });
  }

  const db = await getDb();
  await db.run(
    `INSERT INTO instruments (name, updated_at)
     VALUES (?, CURRENT_TIMESTAMP)
     ON CONFLICT(name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
    [name],
  );

  const row = await db.get<{ id: number; name: string }>(
    "SELECT id, name FROM instruments WHERE name = ?",
    [name],
  );

  return NextResponse.json(row, { status: 201 });
}
