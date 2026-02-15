"use client";

import { useEffect, useState } from "react";

interface CommandBarProps {
  totalNotes: number;
  totalInstruments: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

export function CommandBar({ totalNotes, totalInstruments, bullishCount, bearishCount, neutralCount }: CommandBarProps) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(
        now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() +
          " " +
          now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-terminal-border bg-terminal-dark px-4 py-1.5 font-mono text-[11px]">
      <div className="flex items-center gap-4">
        <span className="font-bold text-neon-amber">FI-JOURNAL</span>
        <span className="text-fg-secondary">│</span>
        <span className="text-neon-green">FIXED INCOME INTELLIGENCE PLATFORM</span>
        <span className="text-fg-secondary">│</span>
        <span className="text-fg-secondary">
          NOTES: <span className="text-fg-primary">{totalNotes}</span>
        </span>
        <span className="text-fg-secondary">
          INSTR: <span className="text-fg-primary">{totalInstruments}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-neon-green">▲ {bullishCount}</span>
        <span className="text-neon-red">▼ {bearishCount}</span>
        <span className="text-neon-amber">◆ {neutralCount}</span>
        <span className="text-fg-secondary">│</span>
        <span className="text-neon-cyan">{clock}</span>
      </div>
    </header>
  );
}
