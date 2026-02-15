import { Sentiment } from "@/lib/types";

const toneBySentiment: Record<Sentiment, string> = {
  Bullish: "bg-neon-green/10 text-neon-green border-neon-green/50",
  Bearish: "bg-neon-red/10 text-neon-red border-neon-red/50",
  Neutral: "bg-neon-amber/10 text-neon-amber border-neon-amber/50",
};

const symbolBySentiment: Record<Sentiment, string> = {
  Bullish: "▲",
  Bearish: "▼",
  Neutral: "◆",
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${toneBySentiment[sentiment]}`}
    >
      {symbolBySentiment[sentiment]} {sentiment}
    </span>
  );
}
