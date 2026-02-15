"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("ACCESS DENIED");
        setPassword("");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("NET ERR: Server unreachable");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] font-mono">
      <div className="w-full max-w-sm border border-[#2a2a2a] bg-[#111111] p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffaa00]">
            FI-JOURNAL
          </p>
          <p className="mt-1 text-lg font-bold text-[#00ff41]">
            FIXED INCOME INTELLIGENCE
          </p>
          <p className="mt-1 text-[10px] text-[#777777]">
            AUTHENTICATE TO ACCESS TERMINAL
          </p>
        </div>

        {/* Divider */}
        <div className="mb-4 border-t border-[#2a2a2a]" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#ffaa00]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#cccccc] outline-none focus:border-[#ffaa00]"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="border border-[#ff3333]/50 bg-[#ff3333]/5 px-3 py-1.5 text-center text-[10px] font-bold text-[#ff3333]">
              ▶ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[#00ff41] bg-[#00ff41]/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#00ff41] transition-colors hover:bg-[#00ff41]/20 disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "▶ LOGIN"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 border-t border-[#2a2a2a] pt-3 text-center text-[9px] text-[#777777]">
          MANUAL ENTRY │ NO AUTOMATION │ NO LIVE FEEDS
        </div>
      </div>
    </div>
  );
}
