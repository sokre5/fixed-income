"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { NoteItem, Sentiment } from "@/lib/types";
import { SentimentBadge } from "@/components/sentiment-badge";
import { CommandBar } from "@/components/command-bar";

const sentiments: Sentiment[] = ["Bullish", "Bearish", "Neutral"];

interface FormState {
  dataPoint: string;
  actualValue: string;
  expectedValue: string;
  observedOn: string;
  sentiment: Sentiment;
  commentary: string;
}

const initialFormState: FormState = {
  dataPoint: "",
  actualValue: "",
  expectedValue: "",
  observedOn: new Date().toISOString().slice(0, 10),
  sentiment: "Neutral",
  commentary: "",
};

/* ── Reusable terminal-style classes ─────────────────────────── */
const inputClass =
  "w-full border border-terminal-border bg-terminal-black px-2 py-1.5 font-mono text-xs text-fg-primary outline-none focus:border-neon-amber transition-colors";
const labelClass = "mb-0.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-neon-amber";
const selectClass =
  "border border-terminal-border bg-terminal-black px-2 py-1.5 font-mono text-xs text-fg-primary outline-none focus:border-neon-amber cursor-pointer";

export function Dashboard() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [instruments, setInstruments] = useState<Array<{ id: number; name: string }>>([]);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [instrumentMode, setInstrumentMode] = useState<"existing" | "new">("existing");
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>("");
  const [newInstrumentName, setNewInstrumentName] = useState<string>("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [instrumentFilter, setInstrumentFilter] = useState<string>("all");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<{
    dataPoint: string;
    actualValue: string;
    expectedValue: string;
    observedOn: string;
    sentiment: Sentiment;
    commentary: string;
  }>({
    dataPoint: "",
    actualValue: "",
    expectedValue: "",
    observedOn: "",
    sentiment: "Neutral",
    commentary: "",
  });

  /* ── Stats ────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const bullish = notes.filter((n) => n.sentiment === "Bullish").length;
    const bearish = notes.filter((n) => n.sentiment === "Bearish").length;
    const neutral = notes.filter((n) => n.sentiment === "Neutral").length;
    return { bullish, bearish, neutral };
  }, [notes]);

  /* ── Grouped notes by instrument ──────────────────────────── */
  const groupedNotes = useMemo(() => {
    const groups: Record<string, NoteItem[]> = {};
    for (const note of notes) {
      if (!groups[note.instrumentName]) groups[note.instrumentName] = [];
      groups[note.instrumentName].push(note);
    }
    return groups;
  }, [notes]);

  /* ── Data loading ─────────────────────────────────────────── */
  async function loadData() {
    const search = new URLSearchParams();
    if (sentimentFilter !== "all") search.set("sentiment", sentimentFilter);
    if (instrumentFilter !== "all") search.set("instrumentId", instrumentFilter);

    const [notesRes, instrumentsRes] = await Promise.all([
      fetch(`/api/notes?${search.toString()}`),
      fetch("/api/instruments"),
    ]);

    if (!notesRes.ok || !instrumentsRes.ok) throw new Error("Load failed");

    const [notesJson, instrumentsJson] = await Promise.all([notesRes.json(), instrumentsRes.json()]);
    setNotes(notesJson);
    setInstruments(instrumentsJson);
  }

  useEffect(() => {
    loadData().catch(() => setErrorMessage("SYS ERROR: Failed to load journal data"));
  }, [sentimentFilter, instrumentFilter]);

  /* ── Submit ───────────────────────────────────────────────── */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    let instrumentName = "";
    if (instrumentMode === "existing") {
      const instrument = instruments.find((item) => item.id.toString() === selectedInstrumentId);
      instrumentName = instrument?.name ?? "";
    } else {
      instrumentName = newInstrumentName.trim();
    }

    if (!instrumentName) {
      setErrorMessage("ERR: Select or create an instrument");
      return;
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, instrumentName }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setErrorMessage(payload.message ?? "ERR: Failed to save");
        return;
      }

      setFormState({ ...initialFormState, observedOn: new Date().toISOString().slice(0, 10) });
      if (instrumentMode === "new") setNewInstrumentName("");
      await loadData();
    } catch {
      setErrorMessage("NET ERR: Server unreachable");
    }
  }

  /* ── Delete ───────────────────────────────────────────────── */
  async function handleDelete(noteId: number) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (response.ok) {
        await loadData();
        return;
      }
      setErrorMessage("ERR: Delete failed");
    } catch {
      setErrorMessage("NET ERR: Could not delete");
    }
  }

  /* ── Edit ──────────────────────────────────────────────────── */
  function beginEdit(note: NoteItem) {
    setEditingId(note.id);
    setEditState({
      dataPoint: note.dataPoint,
      actualValue: note.actualValue,
      expectedValue: note.expectedValue,
      observedOn: note.observedOn,
      sentiment: note.sentiment,
      commentary: note.commentary,
    });
  }

  async function saveEdit(noteId: number) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editState),
      });
      if (!response.ok) {
        setErrorMessage("ERR: Update failed");
        return;
      }
      setEditingId(null);
      await loadData();
    } catch {
      setErrorMessage("NET ERR: Could not update");
    }
  }

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-terminal-black font-mono">
      {/* ── COMMAND BAR ─────────────────────────────────────── */}
      <CommandBar
        totalNotes={notes.length}
        totalInstruments={instruments.length}
        bullishCount={stats.bullish}
        bearishCount={stats.bearish}
        neutralCount={stats.neutral}
      />

      {/* ── MAIN GRID ───────────────────────────────────────── */}
      <div className="flex flex-1">
        {/* ── LEFT: INPUT PANEL ────────────────────────────── */}
        <aside className="w-[380px] shrink-0 border-r border-terminal-border bg-terminal-dark">
          <div className="flex items-center gap-2 border-b border-terminal-border px-3 py-1.5">
            <span className="text-[10px] font-bold tracking-widest text-neon-green">INPUT</span>
            <span className="text-[10px] text-fg-secondary">MANUAL OBSERVATION ENTRY</span>
          </div>

          <form className="space-y-3 p-3" onSubmit={handleSubmit}>
            {/* Instrument Selector */}
            <div>
              <label className={labelClass}>Instrument</label>
              <div className="flex gap-1">
                <select
                  value={instrumentMode}
                  onChange={(e) => setInstrumentMode(e.target.value as "existing" | "new")}
                  className={`${selectClass} w-[120px]`}
                >
                  <option value="existing">EXISTING</option>
                  <option value="new">NEW</option>
                </select>
                {instrumentMode === "existing" ? (
                  <select
                    value={selectedInstrumentId}
                    onChange={(e) => setSelectedInstrumentId(e.target.value)}
                    className={`${selectClass} flex-1`}
                  >
                    <option value="">-- SELECT --</option>
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={newInstrumentName}
                    onChange={(e) => setNewInstrumentName(e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                )}
              </div>
            </div>

            {/* Data Point + Actual */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Data Point</label>
                <input
                  required
                  value={formState.dataPoint}
                  onChange={(e) => setFormState((s) => ({ ...s, dataPoint: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Actual</label>
                <input
                  required
                  value={formState.actualValue}
                  onChange={(e) => setFormState((s) => ({ ...s, actualValue: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Expected Value */}
            <div>
              <label className={labelClass}>Expected</label>
              <input
                required
                value={formState.expectedValue}
                onChange={(e) => setFormState((s) => ({ ...s, expectedValue: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Date + Sentiment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Date</label>
                <input
                  required
                  type="date"
                  value={formState.observedOn}
                  onChange={(e) => setFormState((s) => ({ ...s, observedOn: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sentiment</label>
                <select
                  value={formState.sentiment}
                  onChange={(e) => setFormState((s) => ({ ...s, sentiment: e.target.value as Sentiment }))}
                  className={`${selectClass} w-full`}
                >
                  {sentiments.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Commentary */}
            <div>
              <label className={labelClass}>Commentary</label>
              <textarea
                required
                value={formState.commentary}
                onChange={(e) => setFormState((s) => ({ ...s, commentary: e.target.value }))}
                className={`${inputClass} h-24 resize-none`}
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="border border-neon-red/50 bg-neon-red/5 px-2 py-1 text-[10px] font-bold text-neon-red">
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              className="w-full border border-neon-green bg-neon-green/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-neon-green transition-colors hover:bg-neon-green/20"
              type="submit"
            >
              ▶ Submit Observation
            </button>
          </form>
        </aside>

        {/* ── RIGHT: DATA PANEL ─────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          {/* Panel Header with Filters */}
          <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-dark px-4 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-neon-green">JOURNAL</span>
              <span className="text-[10px] text-fg-secondary">
                {notes.length} OBSERVATION{notes.length !== 1 ? "S" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={instrumentFilter}
                onChange={(e) => setInstrumentFilter(e.target.value)}
                className={`${selectClass} text-[10px]`}
              >
                <option value="all">ALL INSTRUMENTS</option>
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id.toString()}>
                    {inst.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className={`${selectClass} text-[10px]`}
              >
                <option value="all">ALL SENTIMENT</option>
                {sentiments.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-3">
            {notes.length === 0 ? (
              <div className="border border-terminal-border bg-terminal-dark p-6 text-center">
                <p className="text-xs text-fg-secondary">NO DATA</p>
                <p className="mt-1 text-[10px] text-fg-secondary">
                  Use the INPUT panel to log your first fixed-income observation.
                </p>
              </div>
            ) : (
              /* ── Grouped by instrument ─────────────────────── */
              Object.entries(groupedNotes).map(([instrumentName, instrumentNotes]) => (
                <div key={instrumentName} className="mb-4">
                  {/* Instrument Header */}
                  <div className="flex items-center gap-3 border-b border-neon-amber/30 pb-1 mb-1">
                    <span className="text-[11px] font-bold text-neon-amber">{instrumentName.toUpperCase()}</span>
                    <span className="text-[10px] text-fg-secondary">
                      {instrumentNotes.length} entr{instrumentNotes.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_100px_100px_90px_80px_60px] gap-px bg-terminal-border text-[10px] font-bold uppercase tracking-widest text-fg-secondary">
                    <div className="bg-terminal-dark px-2 py-1">Data Point</div>
                    <div className="bg-terminal-dark px-2 py-1">Actual</div>
                    <div className="bg-terminal-dark px-2 py-1">Expected</div>
                    <div className="bg-terminal-dark px-2 py-1">Date</div>
                    <div className="bg-terminal-dark px-2 py-1">Signal</div>
                    <div className="bg-terminal-dark px-2 py-1 text-right">Ops</div>
                  </div>

                  {/* Table Rows */}
                  {instrumentNotes.map((note) => (
                    <div key={note.id}>
                      <div className="grid grid-cols-[1fr_100px_100px_90px_80px_60px] gap-px bg-terminal-border text-xs">
                        <div className="bg-terminal-black px-2 py-1.5 font-medium text-fg-primary">
                          {note.dataPoint}
                        </div>
                        <div className="bg-terminal-black px-2 py-1.5 font-mono text-neon-cyan">
                          {note.actualValue}
                        </div>
                        <div className="bg-terminal-black px-2 py-1.5 font-mono text-fg-secondary">
                          {note.expectedValue}
                        </div>
                        <div className="bg-terminal-black px-2 py-1.5 text-[10px] text-fg-secondary">
                          {note.observedOn}
                        </div>
                        <div className="bg-terminal-black px-2 py-1">
                          <SentimentBadge sentiment={note.sentiment} />
                        </div>
                        <div className="flex items-center justify-end gap-1 bg-terminal-black px-2 py-1">
                          <button
                            className="text-[10px] text-neon-blue hover:text-neon-cyan"
                            onClick={() => beginEdit(note)}
                            type="button"
                          >
                            EDT
                          </button>
                          <button
                            className="text-[10px] text-neon-red/60 hover:text-neon-red"
                            onClick={() => handleDelete(note.id)}
                            type="button"
                          >
                            DEL
                          </button>
                        </div>
                      </div>

                      {/* Commentary Row */}
                      {note.commentary && editingId !== note.id && (
                        <div className="border-l-2 border-terminal-muted bg-terminal-dark px-3 py-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-fg-secondary">
                            COMMENT ›{" "}
                          </span>
                          <span className="text-[11px] leading-relaxed text-fg-primary">{note.commentary}</span>
                        </div>
                      )}

                      {/* Inline Edit */}
                      {editingId === note.id && (
                        <div className="border border-neon-amber/30 bg-terminal-dark p-2 space-y-2">
                          <div className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-neon-amber">
                            ─── EDIT MODE ───
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[9px] font-bold uppercase text-fg-secondary">Data Point</label>
                              <input
                                value={editState.dataPoint}
                                onChange={(e) => setEditState((s) => ({ ...s, dataPoint: e.target.value }))}
                                className={`${inputClass} text-[11px]`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase text-fg-secondary">Actual</label>
                              <input
                                value={editState.actualValue}
                                onChange={(e) => setEditState((s) => ({ ...s, actualValue: e.target.value }))}
                                className={`${inputClass} text-[11px]`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase text-fg-secondary">Expected</label>
                              <input
                                value={editState.expectedValue}
                                onChange={(e) => setEditState((s) => ({ ...s, expectedValue: e.target.value }))}
                                className={`${inputClass} text-[11px]`}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold uppercase text-fg-secondary">Date</label>
                              <input
                                type="date"
                                value={editState.observedOn}
                                onChange={(e) => setEditState((s) => ({ ...s, observedOn: e.target.value }))}
                                className={`${inputClass} text-[11px]`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase text-fg-secondary">Sentiment</label>
                              <select
                                value={editState.sentiment}
                                onChange={(e) =>
                                  setEditState((s) => ({ ...s, sentiment: e.target.value as Sentiment }))
                                }
                                className={`${selectClass} w-full text-[11px]`}
                              >
                                {sentiments.map((s) => (
                                  <option key={s} value={s}>
                                    {s.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase text-fg-secondary">Commentary</label>
                            <textarea
                              value={editState.commentary}
                              onChange={(e) => setEditState((s) => ({ ...s, commentary: e.target.value }))}
                              className={`${inputClass} h-16 resize-none text-[11px]`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="border border-neon-green bg-neon-green/10 px-3 py-1 text-[10px] font-bold text-neon-green hover:bg-neon-green/20"
                              onClick={() => saveEdit(note.id)}
                              type="button"
                            >
                              ▶ SAVE
                            </button>
                            <button
                              className="border border-terminal-border px-3 py-1 text-[10px] font-bold text-fg-secondary hover:text-fg-primary"
                              onClick={() => setEditingId(null)}
                              type="button"
                            >
                              ✕ CANCEL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────── */}
      <footer className="flex items-center justify-between border-t border-terminal-border bg-terminal-dark px-4 py-1 text-[10px]">
        <span className="text-fg-secondary">
          MANUAL ENTRY │ NO AUTOMATION │ NO LIVE FEEDS
        </span>
        <span className="text-fg-secondary">
          SQLite │ Next.js │ v0.1.0
        </span>
      </footer>
    </div>
  );
}
