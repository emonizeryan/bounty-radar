# Requirements — Bounty Radar

## Introduction
Bounty Radar is a single-page dashboard for zero-capital bounty hunters. It stitches free bounty opportunities from four incompatible sources — make.fun (JSON API), Immunefi (program board), HackenProof (ongoing bounties), Devpost hackathons (rules pages) — into one ranked board. Every bounty is scored 0–100 with the fee, payout, KYC, eligibility, and freshness facts shown up front, so a hunter can decide in seconds whether a bounty is worth their time.

## Glossary
- **Bounty:** one earnable opportunity (bug bounty program, hackathon, trading competition, testnet).
- **Verdict:** GO (score ≥ 70), LOTTERY (30–69), NO-GO (< 30).
- **Snapshot:** curated data copied from a dated source (sweeps #1–#4), labelled with its date. Distinct from **live** data fetched from a public API at load time.
- **Score:** 0–100, from five sub-scores: fee, payout, KYC, eligibility, freshness.

## Requirements

### Requirement 1 — Ranked board
**User Story:** As a bounty hunter, I want all free bounties on one ranked board, so I don't check four sites every day.

#### Acceptance Criteria
1. WHEN the page loads, THE SYSTEM SHALL display every bounty in `data/bounties.json` plus live make.fun competitions, sorted by score descending by default.
2. WHEN a bounty has a score ≥ 70, THE SYSTEM SHALL label it GO; 30–69 LOTTERY; below 30 NO-GO.
3. WHEN the page loads, THE SYSTEM SHALL show header stats: counts per verdict and the total cash prize pool of GO + LOTTERY bounties.

### Requirement 2 — Filters and search
**User Story:** As a bounty hunter, I want to filter by verdict and source and search by name, so I can find the bounties that fit me.

#### Acceptance Criteria
1. WHEN the user clicks a verdict chip, THE SYSTEM SHALL show only bounties with that verdict (All shows everything).
2. WHEN the user picks a source, THE SYSTEM SHALL show only bounties from that source.
3. WHEN the user types in the search box, THE SYSTEM SHALL filter bounties by name and notes (case-insensitive, live as they type).
4. WHEN the user changes the sort, THE SYSTEM SHALL re-order by score, deadline, or prize.

### Requirement 3 — Score transparency
**User Story:** As a bounty hunter, I want to see WHY a bounty scored what it did, so I can trust the ranking.

#### Acceptance Criteria
1. WHEN the user expands a bounty card, THE SYSTEM SHALL show the five sub-scores (fee / payout / KYC / eligibility / freshness) as bars with numbers.
2. WHEN the user expands a bounty card, THE SYSTEM SHALL show the screening notes and the official link.
3. WHEN a bounty's data is a snapshot, THE SYSTEM SHALL label it "snapshot" with its date; live data SHALL be labelled "live".

### Requirement 4 — Live make.fun data
**User Story:** As a bounty hunter, I want the make.fun competitions to be live, so I never chase a closed competition.

#### Acceptance Criteria
1. WHEN the page loads, THE SYSTEM SHALL fetch `https://make.fun/api/competitions?limit=50` (public GET, no key).
2. WHEN the fetch succeeds, THE SYSTEM SHALL merge open competitions into the board with source "make.fun" and provenance "live".
3. WHEN the fetch fails, THE SYSTEM SHALL keep the snapshot data and show a small "live data unavailable" note (never a blank board, never an error page).

### Requirement 5 — Zero-cost static hosting
**User Story:** As the developer, I want the app to run as pure static files, so hosting costs $0 on GitHub Pages.

#### Acceptance Criteria
1. THE SYSTEM SHALL have no build step, no backend, and no secrets.
2. THE SYSTEM SHALL run by opening `index.html` or serving the folder with any static server.
3. THE SYSTEM SHALL NOT require any API key at runtime.
