"use client";

import { FormEvent, useEffect, useState } from "react";
import { StudyNote } from "@/lib/types";

function handle401(res: Response) {
  if (res.status === 401) {
    window.location.href = "/login";
    return true;
  }
  return false;
}

const inputClass =
  "w-full border border-terminal-border bg-terminal-black px-2 py-1.5 font-mono text-xs text-fg-primary outline-none focus:border-neon-amber transition-colors";

export function StudyNotes() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Load ──────────────────────────────────────────────────── */
  async function loadNotes() {
    try {
      const res = await fetch("/api/study");
      if (handle401(res)) return;
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data);
    } catch {
      setError("SYS ERROR: Failed to load study notes");
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  /* ── Create ────────────────────────────────────────────────── */
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError("");

    try {
      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), content: "" }),
      });
      if (handle401(res)) return;
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.message ?? "ERR: Failed to create note");
        return;
      }
      const created = await res.json();
      setNewTitle("");
      await loadNotes();
      // Auto-select the new note
      setSelectedId(created.id);
      setEditTitle(created.title);
      setEditContent(created.content);
    } catch {
      setError("NET ERR: Server unreachable");
    }
  }

  /* ── Select ────────────────────────────────────────────────── */
  function selectNote(note: StudyNote) {
    setSelectedId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  /* ── Save ──────────────────────────────────────────────────── */
  async function handleSave() {
    if (selectedId === null) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/study/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (handle401(res)) return;
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.message ?? "ERR: Failed to save");
        return;
      }
      await loadNotes();
    } catch {
      setError("NET ERR: Could not save");
    } finally {
      setSaving(false);
    }
  }

  /* ── Delete ────────────────────────────────────────────────── */
  async function handleDelete(id: number) {
    setError("");
    try {
      const res = await fetch(`/api/study/${id}`, { method: "DELETE" });
      if (handle401(res)) return;
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.message ?? "ERR: Delete failed");
        return;
      }
      if (selectedId === id) {
        setSelectedId(null);
        setEditTitle("");
        setEditContent("");
      }
      await loadNotes();
    } catch {
      setError("NET ERR: Could not delete");
    }
  }

  /* ── Render ────────────────────────────────────────────────── */
  const selectedNote = notes.find((n) => n.id === selectedId);

  return (
    <div className="flex h-full flex-col bg-terminal-black font-mono">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-dark px-4 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-neon-green">STUDY</span>
          <span className="text-[10px] text-fg-secondary">
            KNOWLEDGE BASE │ {notes.length} NOTE{notes.length !== 1 ? "S" : ""}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Note Index ────────────────────────────────── */}
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-terminal-border bg-terminal-dark">
          {/* Create new */}
          <form onSubmit={handleCreate} className="border-b border-terminal-border p-2">
            <div className="flex gap-1">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`${inputClass} flex-1 text-[11px]`}
                placeholder="New topic title..."
              />
              <button
                type="submit"
                className="border border-neon-green bg-neon-green/10 px-2 py-1 text-[10px] font-bold text-neon-green hover:bg-neon-green/20"
              >
                +
              </button>
            </div>
          </form>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="p-3 text-center text-[10px] text-fg-secondary">
                NO STUDY NOTES YET
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`group flex cursor-pointer items-center justify-between border-b border-terminal-border px-3 py-2 transition-colors ${
                    selectedId === note.id
                      ? "border-l-2 border-l-neon-amber bg-terminal-panel"
                      : "hover:bg-terminal-panel"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-bold ${
                        selectedId === note.id ? "text-neon-amber" : "text-fg-primary"
                      }`}
                    >
                      {note.title.toUpperCase()}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-fg-secondary">
                      {note.content
                        ? note.content.slice(0, 60) + (note.content.length > 60 ? "..." : "")
                        : "Empty — click to write"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="ml-2 hidden text-[10px] text-neon-red/40 hover:text-neon-red group-hover:inline"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── RIGHT: Editor ───────────────────────────────────── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedNote ? (
            <>
              {/* Title */}
              <div className="border-b border-terminal-border bg-terminal-dark px-4 py-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border-none bg-transparent font-mono text-sm font-bold uppercase tracking-widest text-neon-amber outline-none"
                />
                <p className="mt-0.5 text-[10px] text-fg-secondary">
                  Created {new Date(selectedNote.createdAt).toLocaleDateString("en-GB")} │ Updated{" "}
                  {new Date(selectedNote.updatedAt).toLocaleDateString("en-GB")}
                </p>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-auto p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-full w-full resize-none border-none bg-transparent font-mono text-xs leading-relaxed text-fg-primary outline-none"
                  spellCheck={false}
                />
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between border-t border-terminal-border bg-terminal-dark px-4 py-1.5">
                <div className="text-[10px] text-fg-secondary">
                  {editContent.length} CHARS │ {editContent.split("\n").length} LINES
                </div>
                <div className="flex gap-2">
                  {error && (
                    <span className="text-[10px] font-bold text-neon-red">{error}</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="border border-neon-green bg-neon-green/10 px-3 py-1 text-[10px] font-bold text-neon-green hover:bg-neon-green/20 disabled:opacity-50"
                    type="button"
                  >
                    {saving ? "SAVING..." : "▶ SAVE"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-fg-secondary">SELECT OR CREATE A TOPIC</p>
                <p className="mt-1 text-[10px] text-fg-secondary">
                  Use the left panel to add study topics like CPI, FED FUNDS, YIELD CURVE, etc.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
