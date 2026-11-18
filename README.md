# Bounty Radar

Every free bounty worth a zero-capital hunter's time — make.fun, Immunefi, HackenProof and Devpost hackathons — stitched into one ranked board, scored 0–100 with the fee, payout and KYC facts up front.

Built for **Kiroween 2026** (AWS / Devpost) with **Kiro** — spec-driven development, specs live in `.kiro/specs/bounty-radar/`.

## SLAY HACKS 2026 adaptation

First built for Kiroween 2026 (16–17 Nov 2026, inside SLAY's development window that began 7 Nov 2026) and entered in **SLAY HACKS 2026** with one addition:

- **"Ask AI" explainer on every bounty card.** A button calls the **Pollinations free public text API** (`GET https://text.pollinations.ai/<prompt>`, no API key, no account, no tracking) with the bounty name, score, verdict, prize, fee, KYC and deadline, and renders a 2-sentence explanation of whether the bounty is worth a zero-capital hunter's time. The text is labeled "AI-generated explanation (Pollinations, free public API) — may be inaccurate". If the call fails or the user is offline, the card shows "AI explainer unavailable right now — the score breakdown below is still accurate" and the board keeps working — the AI is an add-on, never a dependency.
- **SLAY HACKS 2026 itself is on the board** as a dated snapshot entry (2026-11-18), scored 58/100 LOTTERY with the same public heuristic as every other entry.

Honest scope note: the 0–100 score is a **deterministic formula** (fee 20 / payout 20 / KYC 15 / eligibility 15 / freshness 30) — it is not AI. The AI in this project is the per-card explainer above, plus Kiro (AI coding agent) used to build the app.

## Run it

No build step, no backend, no keys. Any static host works (GitHub Pages included):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly.

## Data

- **Snapshot** (`data/bounties.json`, dated 2026-11-17): curated from the squad's bounty sweeps #1–#4. Each entry carries a 0–100 score with a five-part breakdown (fee / payout / KYC / eligibility / freshness), a verdict (GO ≥ 70, LOTTERY 30–69, NO-GO < 30), fee, KYC, deadline, and the official link.
- **Live**: at load time the page fetches the public make.fun competitions board (`GET https://make.fun/api/competitions?limit=50`, no key) and merges open competitions. If the fetch fails, the snapshot still renders with a note — never a blank board.

## Scores

Scores are the squad's screening heuristic, shown transparently with the breakdown on every card — not a guarantee of payout. "Free" means $0 to enter. Always read the official rules before submitting. Not financial advice.

## Kiro usage

- `/.kiro/specs/bounty-radar/` — requirements, design, task list (spec-driven development).
- `/.kiro/steering/` — product, structure, and tech guidance.
- Built on Kiro Free tier (50 credits/month, $0) — see `../KIRO-PLAN.md` for the credit budget.
