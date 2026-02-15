# FI-JOURNAL │ Fixed Income Intelligence Platform

> A Bloomberg Terminal-inspired manual insight tracker for fixed-income markets.  
> No automation. No live feeds. Pure human judgment, logged and organized.

![Terminal UI](https://img.shields.io/badge/UI-Terminal%20Style-00ff41?style=flat-square&labelColor=0a0a0a)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![SQLite](https://img.shields.io/badge/SQLite-Embedded-003B57?style=flat-square&logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

---

## Vision

Fixed-income traders need clarity, not noise. This platform provides a **journal-based workspace** where traders manually log their market observations — yield movements, spread changes, central bank signals — with structured data points, actual vs. expected values, and directional sentiment.

The UI follows the **Bloomberg Terminal design philosophy**: obsidian black background, neon green/red/amber signaling, monospaced typography, zero rounded corners, and a utilitarian command-bar layout optimized for information density.

---

## Architecture: Multi-Agent Design

This platform was designed by a coordinated team of specialized AI agents:

### Agent 1: Fixed Income SME (Subject Matter Expert)
**Responsibility:** Define core data requirements for fixed-income analysis.

- Identified key data points: instruments, yields, spreads, macro indicators
- Defined the observation schema: data point, actual value, expected value, sentiment signal, commentary
- Established the journal-based workflow for manual market tracking

### Agent 2: Modern UI/UX Engineer
**Responsibility:** Design a high-density Bloomberg Terminal-inspired interface.

- **Color palette:** Obsidian black (`#0a0a0a`), neon green (`#00ff41`), bright red (`#ff3333`), amber (`#ffaa00`), cyan (`#00d4ff`)
- **Typography:** JetBrains Mono — monospaced, purpose-built for data display
- **Layout:** Command bar (top) → Input panel (left) → Data grid (right) → Status bar (bottom)
- **Design rules:** No rounded corners, no soft shadows, no decorative elements. Pure utility.

### Agent 3: Technical Systems Architect
**Responsibility:** Design the backend and data layer.

- **Framework:** Next.js 14 (App Router) — unified frontend + API
- **Database:** SQLite — zero-config, file-based, perfect for single-user journals
- **API:** RESTful routes for instruments and notes CRUD
- **Deployment:** Docker container with volume-mounted persistent storage

### Agent 4: QA & Reliability Engineer
**Responsibility:** Ensure data integrity and application stability.

- Playwright E2E test suite for critical user flows
- Input validation on all API endpoints
- Error boundaries and user-facing error messaging
- Data validation: sentiment enum checking, required field enforcement

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | SSR + API routes |
| Styling | Tailwind CSS 3.4 | Terminal-style UI theming |
| Font | JetBrains Mono | Monospaced data display |
| Database | SQLite | Embedded persistence |
| Testing | Playwright | E2E browser testing |
| Container | Docker | One-command deployment |
| Language | TypeScript 5 | Type-safe full stack |

---

## Quick Start

### Local Development (recommended)

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Open **http://localhost:3001** — starts in ~2 seconds.

### Docker (production)

```bash
docker compose up --build -d
```

Open **http://localhost:3001** — builds and starts containerized.

---

## Project Structure

```
fixed-income/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── instruments/route.ts   # GET/POST instruments
│   │   │   └── notes/
│   │   │       ├── route.ts           # GET/POST notes
│   │   │       └── [id]/route.ts      # PUT/DELETE individual notes
│   │   ├── globals.css                # Terminal theme styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Entry point
│   ├── components/
│   │   ├── command-bar.tsx            # Top command bar with live clock
│   │   ├── dashboard.tsx              # Main terminal dashboard
│   │   └── sentiment-badge.tsx        # ▲ Bullish / ▼ Bearish / ◆ Neutral
│   ├── lib/
│   │   ├── db.ts                      # SQLite init + schema
│   │   └── types.ts                   # TypeScript interfaces
│   ├── data/                          # SQLite DB (gitignored)
│   ├── Dockerfile
│   └── package.json
├── schema/
│   ├── schema.sql                     # Database DDL
│   └── entry-template.json            # Example API payload
├── docker-compose.yml
└── README.md
```

---

## Database Schema

```sql
CREATE TABLE instruments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instrument_id INTEGER NOT NULL,
  data_point TEXT NOT NULL,
  actual_value TEXT NOT NULL,
  expected_value TEXT NOT NULL,
  observed_on TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('Bullish', 'Bearish', 'Neutral')),
  commentary TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
);
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/instruments` | List all instruments |
| `POST` | `/api/instruments` | Create new instrument |
| `GET` | `/api/notes` | List notes (filterable by sentiment, instrumentId) |
| `POST` | `/api/notes` | Create new observation |
| `PUT` | `/api/notes/:id` | Update observation |
| `DELETE` | `/api/notes/:id` | Delete observation |

### Example Payload

```json
{
  "instrumentName": "US 10Y",
  "dataPoint": "Yield",
  "actualValue": "4.25%",
  "expectedValue": "4.20%",
  "observedOn": "2026-02-15",
  "sentiment": "Bearish",
  "commentary": "Yield pushed higher post-CPI. Hawkish repricing in front-end."
}
```

---

## Design Principles

1. **Manual-first** — No automated data feeds. Every data point is a deliberate human observation.
2. **Information density** — Maximum data per pixel. No whitespace waste.
3. **Terminal aesthetic** — Professional, utilitarian, legacy-tech inspired.
4. **Zero friction** — Input form always visible. Submit → see it immediately in the grid.
5. **Instrument grouping** — Notes organized by underlying, like a trader's watchlist.

---

## License

MIT
