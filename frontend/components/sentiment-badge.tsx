import { Sentiment } from "@/lib/types";

const toneBySentiment: Record<Sentiment, string> = {
  Bullish: "bg-signal-bullish/20 text-signal-bullish border-signal-bullish/40",
  Bearish: "bg-signal-bearish/20 text-signal-bearish border-signal-bearish/40",
  Neutral: "bg-signal-neutral/20 text-signal-neutral border-signal-neutral/40",
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-xs font-medium tracking-wide ${toneBySentiment[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
