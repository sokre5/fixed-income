import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.execute({
      sql: `SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt
            FROM study_notes
            ORDER BY updated_at DESC`,
      args: [],
    });

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/study error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const db = await getDb();
    const insertResult = await db.execute({
      sql: `INSERT INTO study_notes (title, content, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)`,
      args: [title, content],
    });

    const newId = insertResult.lastInsertRowid;
    if (newId == null) {
      return NextResponse.json({ message: "Insert failed" }, { status: 500 });
    }

    const created = await db.execute({
      sql: `SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt
            FROM study_notes WHERE id = ?`,
      args: [Number(newId)],
    });

    return NextResponse.json(created.rows[0], { status: 201 });
  } catch (err) {
    console.error("POST /api/study error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
