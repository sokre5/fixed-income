"use client";

import { FormEvent, useEffect, useState } from "react";

import { NoteItem, Sentiment } from "@/lib/types";
import { SentimentBadge } from "@/components/sentiment-badge";

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

  async function loadData() {
    const search = new URLSearchParams();
    if (sentimentFilter !== "all") {
      search.set("sentiment", sentimentFilter);
    }
    if (instrumentFilter !== "all") {
      search.set("instrumentId", instrumentFilter);
    }

    const [notesRes, instrumentsRes] = await Promise.all([
      fetch(`/api/notes?${search.toString()}`),
      fetch("/api/instruments"),
    ]);

    if (!notesRes.ok || !instrumentsRes.ok) {
      throw new Error("Unable to load manual insights");
    }

    const [notesJson, instrumentsJson] = await Promise.all([notesRes.json(), instrumentsRes.json()]);
    setNotes(notesJson);
    setInstruments(instrumentsJson);
  }

  useEffect(() => {
    loadData().catch(() => setErrorMessage("Failed to load journal data"));
  }, [sentimentFilter, instrumentFilter]);

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
      setErrorMessage("Choose an instrument or create a new one");
      return;
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          instrumentName,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setErrorMessage(payload.message ?? "Failed to save note");
        return;
      }

      setFormState({ ...initialFormState, observedOn: new Date().toISOString().slice(0, 10) });
      if (instrumentMode === "new") {
        setNewInstrumentName("");
      }
      await loadData();
    } catch {
      setErrorMessage("Network error. Check that the app server is running and try again.");
    }
  }

  async function handleDelete(noteId: number) {
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (response.ok) {
        await loadData();
        return;
      }
      setErrorMessage("Failed to delete note");
    } catch {
      setErrorMessage("Network error. Could not delete the note.");
    }
  }

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
        setErrorMessage("Failed to update note");
        return;
      }

      setEditingId(null);
      await loadData();
    } catch {
      setErrorMessage("Network error. Could not update the note.");
    }
  }

  return (
    <main className="min-h-screen bg-surface-950 p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.15fr_2fr]">
        <section className="rounded-lg border border-surface-800 bg-surface-900 p-4">
          <p className="text-xs uppercase tracking-widest text-accent-amber">Manual Insight Input</p>
          <h1 className="mt-1 text-lg font-semibold">Fixed-Income Intelligence Journal</h1>
          <p className="mt-1 text-sm text-text-secondary">No automation. Manual judgment only.</p>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-xs text-text-secondary">Instrument</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={instrumentMode}
                  onChange={(event) => setInstrumentMode(event.target.value as "existing" | "new")}
                  className="rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                >
                  <option value="existing">Select Existing</option>
                  <option value="new">Create New</option>
                </select>
                {instrumentMode === "existing" ? (
                  <select
                    value={selectedInstrumentId}
                    onChange={(event) => setSelectedInstrumentId(event.target.value)}
                    className="rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                  >
                    <option value="">Select instrument</option>
                    {instruments.map((instrument) => (
                      <option key={instrument.id} value={instrument.id.toString()}>
                        {instrument.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={newInstrumentName}
                    onChange={(event) => setNewInstrumentName(event.target.value)}
                    className="rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Data Point</label>
                <input
                  required
                  value={formState.dataPoint}
                  onChange={(event) => setFormState((s) => ({ ...s, dataPoint: event.target.value }))}
                  className="w-full rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Actual Value</label>
                <input
                  required
                  value={formState.actualValue}
                  onChange={(event) => setFormState((s) => ({ ...s, actualValue: event.target.value }))}
                  className="w-full rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-secondary">Expected Value</label>
              <input
                required
                value={formState.expectedValue}
                onChange={(event) => setFormState((s) => ({ ...s, expectedValue: event.target.value }))}
                className="w-full rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Value Date</label>
                <input
                  required
                  type="date"
                  value={formState.observedOn}
                  onChange={(event) => setFormState((s) => ({ ...s, observedOn: event.target.value }))}
                  className="w-full rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Sentiment</label>
                <select
                  value={formState.sentiment}
                  onChange={(event) => setFormState((s) => ({ ...s, sentiment: event.target.value as Sentiment }))}
                  className="w-full rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
                >
                  {sentiments.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {sentiment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-secondary">Commentary on Data Point</label>
              <textarea
                required
                value={formState.commentary}
                onChange={(event) => setFormState((s) => ({ ...s, commentary: event.target.value }))}
                className="h-28 w-full resize-none rounded border border-surface-800 bg-surface-950 px-3 py-2 text-sm"
              />
            </div>

            {errorMessage ? <p className="text-sm text-signal-bearish">{errorMessage}</p> : null}

            <button
              className="w-full rounded bg-accent-amber px-3 py-2 text-sm font-semibold text-surface-950 hover:brightness-110"
              type="submit"
            >
              Save Manual Insight
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-surface-800 bg-surface-900 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium">Summary of Information</p>
              <div className="flex gap-2">
                <select
                  value={instrumentFilter}
                  onChange={(event) => setInstrumentFilter(event.target.value)}
                  className="rounded border border-surface-800 bg-surface-950 px-2 py-1 text-xs"
                >
                  <option value="all">All Instruments</option>
                  {instruments.map((instrument) => (
                    <option key={instrument.id} value={instrument.id.toString()}>
                      {instrument.name}
                    </option>
                  ))}
                </select>
                <select
                  value={sentimentFilter}
                  onChange={(event) => setSentimentFilter(event.target.value)}
                  className="rounded border border-surface-800 bg-surface-950 px-2 py-1 text-xs"
                >
                  <option value="all">All Sentiment</option>
                  {sentiments.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {sentiment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {notes.length === 0 ? (
                <p className="rounded border border-surface-800 bg-surface-950 p-3 text-sm text-text-secondary">
                  No entries yet. Log your first driver observation to start the journal.
                </p>
              ) : (
                notes.map((note) => (
                  <article key={note.id} className="rounded border border-surface-800 bg-surface-950 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{note.dataPoint}</p>
                        <p className="text-xs text-text-secondary">
                          {note.instrumentName} · {note.observedOn}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Actual: {note.actualValue} · Expected: {note.expectedValue}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SentimentBadge sentiment={note.sentiment} />
                        <button
                          className="rounded border border-surface-800 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                          onClick={() => beginEdit(note)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded border border-surface-800 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                          onClick={() => handleDelete(note.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {editingId === note.id ? (
                      <div className="mt-3 space-y-2 rounded border border-surface-800 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            value={editState.dataPoint}
                            onChange={(event) => setEditState((s) => ({ ...s, dataPoint: event.target.value }))}
                            className="rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                          />
                          <input
                            value={editState.actualValue}
                            onChange={(event) => setEditState((s) => ({ ...s, actualValue: event.target.value }))}
                            className="rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                          />
                        </div>
                        <input
                          value={editState.expectedValue}
                          onChange={(event) => setEditState((s) => ({ ...s, expectedValue: event.target.value }))}
                          className="w-full rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={editState.observedOn}
                            onChange={(event) => setEditState((s) => ({ ...s, observedOn: event.target.value }))}
                            className="rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                          />
                          <select
                            value={editState.sentiment}
                            onChange={(event) =>
                              setEditState((s) => ({ ...s, sentiment: event.target.value as Sentiment }))
                            }
                            className="rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                          >
                            {sentiments.map((sentiment) => (
                              <option key={sentiment} value={sentiment}>
                                {sentiment}
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-text-secondary">Commentary on {editState.dataPoint}</p>
                        <textarea
                          value={editState.commentary}
                          onChange={(event) => setEditState((s) => ({ ...s, commentary: event.target.value }))}
                          className="h-20 w-full resize-none rounded border border-surface-800 bg-surface-900 px-2 py-1 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-accent-amber px-2 py-1 text-xs font-medium text-surface-950"
                            onClick={() => saveEdit(note.id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="rounded border border-surface-800 px-2 py-1 text-xs text-text-secondary"
                            onClick={() => setEditingId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-xs uppercase tracking-wide text-text-secondary">Commentary on {note.dataPoint}</p>
                        <p className="mt-1 text-sm leading-relaxed text-text-primary">{note.commentary}</p>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
