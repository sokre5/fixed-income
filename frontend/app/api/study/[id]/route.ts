import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();

  if (!title) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: `UPDATE study_notes
          SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    args: [title, content, id],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  const updated = await db.execute({
    sql: `SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt
          FROM study_notes WHERE id = ?`,
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
    sql: "DELETE FROM study_notes WHERE id = ?",
    args: [id],
  });

  if (result.rowsAffected === 0) {
    return NextResponse.json({ message: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
