# Schema

This folder defines the manual-entry data model for the Fixed-Income Manual Insight Tracker.

## Files
- `schema.sql`: SQLite schema for `instruments` and `notes`.
- `entry-template.json`: Example payload for the first manual journal entry.

## Core fields
- Instrument Name
- Data Point
- Actual Value + Expected Value + Date
- Sentiment Label (`Bullish` / `Bearish` / `Neutral`)
- Commentary linked to each Data Point entry
