# Design — Bounty Radar

## Overview
A single static page (vanilla HTML/CSS/JS, no framework, no build step). Data comes from two layers: a curated snapshot file (`data/bounties.json`, dated, from bounty sweeps #1–#4) and a live fetch of the public make.fun competitions API at load time. All rendering is client-side. Hosting is GitHub Pages ($0).

## Architecture

```
index.html      # page shell: header/stats, filter bar, board container, footer
styles.css      # dark theme, cards, chips, score bars, responsive
app.js          # data loading, merging, filtering, sorting, rendering
data/
  bounties.json # curated snapshot: { version, snapshotDate, bounties: [...] }
```

## Data model

```json
{
  "id": "kiroween-2026",
  "name": "Kiroween 2026",
  "source": "devpost",
  "url": "https://kiroween.devpost.com/",
  "verdict": "GO",
  "score": 72,
  "prize": "$100,000 cash",
  "prizeUsd": 100000,
  "fee": "$0",
  "kyc": "winners only (affidavit + W-8BEN)",
  "deadline": "2026-12-05T05:00:00+07:00",
  "why": "Indonesia eligible, $100k cash, agent-fit high.",
  "scores": { "fee": 20, "payout": 20, "kyc": 15, "eligibility": 10, "freshness": 7 },
  "provenance": "snapshot",
  "snapshotDate": "2026-11-17"
}
```

- `scores` sub-scores sum to `score` (fee 20 / payout 20 / kyc 15 / eligibility 15 / freshness 30 → capped at 100; stored values are the assessed points).
- `verdict` is derived from `score` (≥70 GO, 30–69 LOTTERY, <30 NO-GO) but stored explicitly so a human can override.
- `deadline` is ISO 8601 with timezone; null when open-ended.
- Live make.fun entries are normalized into the same shape at runtime (`provenance: "live"`, verdict from the competition's prize band, score from prize pool + deadline proximity — see app.js).

## Components
- **Header:** title, tagline, stats (GO / LOTTERY / NO-GO counts, total cash pool).
- **Filter bar:** verdict chips, source select, search input, sort select.
- **Board:** grid of bounty cards. Card shows name, source badge, verdict badge, score bar, prize, fee, KYC, deadline, one-line "why", official link. Click expands the score breakdown + notes.
- **Footer:** data provenance, snapshot date, "not financial advice", repo link.

## Correctness properties
- Filters compose (verdict AND source AND search).
- Sorting is stable; ties keep snapshot order.
- A failed live fetch never breaks the board (snapshot-only fallback + note).
- No external requests except the make.fun API fetch and the official outbound links (user clicks only).

## Testing
- `node --check app.js` for syntax.
- Load `data/bounties.json` and assert: every entry has id/name/source/url/score/verdict; scores sum to score (±1); verdict matches score band.
- Serve locally, fetch `/` (200), confirm the board renders with the snapshot count.
