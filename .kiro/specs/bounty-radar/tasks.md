# Tasks — Bounty Radar

## Status: scaffold written by the squad (2026-11-17). Kiro executes/refines these after sign-in, within the 50-credit budget (see ../../KIRO-PLAN.md).

- [x] 1. Scaffold the project
  - Create `index.html`, `styles.css`, `app.js`, `data/bounties.json`, `README.md`
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Curate the snapshot dataset
  - Seed `data/bounties.json` from bounty sweeps #1–#4 (Kiroween, Codegeist, Hermetica, Aster, Twyne, RedStone, Rhea, Morfi, Flop, Paxos, Katana, Sei, Meta Muse, Tzer0)
  - Every entry carries score breakdown, verdict, fee, KYC, deadline, why, official link, snapshot date
  - _Requirements: 1.1, 1.2, 3.2, 3.3_

- [x] 3. Implement the board
  - Render cards from the snapshot, sorted by score desc by default
  - Header stats (verdict counts + total cash pool)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement filters, search, sort
  - Verdict chips, source select, live search, sort by score/deadline/prize
  - Filters compose (AND)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Implement the score breakdown (detail expand)
  - Click a card to expand: five sub-score bars + notes + provenance label
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Implement the live make.fun fetch
  - Public GET `https://make.fun/api/competitions?limit=50`, merge open comps as `provenance: "live"`
  - On failure: snapshot-only + "live data unavailable" note, never a blank board
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Kiro review pass (after sign-in — Kiro CLI)
  - Run through the app in kiro-cli: check the spec against the implementation, fix gaps, tighten copy
  - Verify `node --check app.js` + dataset assertions (see design.md Testing)
  - _Requirements: all_

- [x] 8. Polish pass (after sign-in — Kiro CLI, only if credits remain)
  - Responsive check (mobile width), empty-state text, deadline countdown display
  - _Requirements: 2.x, 3.x_
