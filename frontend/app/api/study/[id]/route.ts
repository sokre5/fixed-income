import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { title, content } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const db = await getDb();
  await db.run(
    "UPDATE study_notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    title.trim(),
    content ?? "",
    params.id
  );

  const row = await db.get(
    "SELECT id, title, content, created_at AS createdAt, updated_at AS updatedAt FROM study_notes WHERE id = ?",
    params.id
  );

  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb();
  const result = await db.run("DELETE FROM study_notes WHERE id = ?", params.id);

  if (result.changes === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
