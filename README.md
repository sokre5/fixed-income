# Fixed-Income Manual Insight Tracker

A minimalist fixed-income intelligence journal for manual market-driver entry.

## Vision
This app replaces cluttered spreadsheets with a high-visibility dashboard where a human analyst logs instrument-level macro drivers and commentary.

## Non-Negotiables
- **No automation**: no live market APIs, no auto-calculators.
- **Clarity first**: summary and sentiment should be readable at a glance.
- **Manual intelligence**: every insight is user-entered and editable.

## Agent Responsibilities (Implemented)

### Fixed Income SME
- Defined instrument-focused input model: Instrument selector/new instrument, Data Point, Actual/Expected values, Date, Sentiment, Commentary.
- Designed sentiment-first reading flow for signal-over-noise decision-making.

### UI/UX Designer
- Implemented dark, terminal-inspired, card-based layout.
- Added high-visibility `Bullish` / `Bearish` / `Neutral` tags.
- Kept commentary section prominent in each insight card.

### Technical Systems Architect
- Built robust CRUD architecture in one Next.js app.
- Added SQLite persistence using API routes and local file DB.
- Enabled filtering: e.g., “show Bearish comments for 10Y Bund.”

### QA & Reliability Engineer
- Added E2E smoke test for visual integrity.
- CI validates install + build pipeline to protect persistence/UI delivery.

## Required Repository Structure

```text
.
├── frontend
│   ├── app
│   │   ├── api
│   │   │   ├── instruments/route.ts
│   │   │   ├── notes/route.ts
│   │   │   └── notes/[id]/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── dashboard.tsx
│   │   └── sentiment-badge.tsx
│   ├── lib
│   │   ├── db.ts
│   │   └── types.ts
│   ├── tests/e2e/dashboard.spec.ts
│   ├── Dockerfile
│   └── package.json
├── schema
│   ├── schema.sql
│   ├── entry-template.json
│   └── README.md
└── README.md
```

## Quick Start

### Docker (single command)
```bash
docker compose up --build
```

Open (Docker): `http://localhost:3001`

### Local dev
```bash
cd frontend
npm install
npm run dev
```

## How to Log the First “CPI Bullish” Entry

1. Open `http://localhost:3001` (Docker) or `http://localhost:3000` (local dev).
2. In **Manual Insight Input**, enter:
	- Instrument: create `US Treasury 10Y` (or select existing)
	- Data Point: `CPI`
	- Actual Value: `2.4% YoY`
	- Expected Value: `2.5% YoY`
	- Value Date: today’s date
	- Sentiment: `Bullish`
	- Commentary: `Cooling inflation supports duration demand at the long end.`
3. Click **Save Manual Insight**.
4. Confirm the new card appears in **Summary of Information** with a green `Bullish` tag.

## Filtering Example
To review bearish notes for Bunds:
- Select instrument: `German 10Y Bund`
- Select sentiment: `Bearish`

The list updates to only matching manual entries.
