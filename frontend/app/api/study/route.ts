import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const rows = await db.all(
    "SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt FROM study_notes ORDER BY updated_at DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.run(
    "INSERT INTO study_notes (title, content) VALUES (?, ?)",
    title.trim(),
    content ?? ""
  );

  const row = await db.get(
    "SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt FROM study_notes WHERE id = ?",
    result.lastID
  );

  return NextResponse.json(row, { status: 201 });
}
