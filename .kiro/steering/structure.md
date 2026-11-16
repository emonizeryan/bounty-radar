# Structure steering — Bounty Radar

## Repo layout
```
bounty-radar/
  index.html
  styles.css
  app.js
  data/
    bounties.json     # curated snapshot dataset (dated)
  .kiro/
    specs/bounty-radar/{requirements.md, design.md, tasks.md}
    steering/{product.md, structure.md, tech.md}
  README.md
```

## Conventions
- Entry point is `index.html` at the repo root (GitHub Pages serves it directly).
- Data lives in `data/bounties.json` — never hard-code bounty facts in `app.js`.
- IDs are kebab-case slugs, stable across snapshot updates.
- `.kiro/` is never gitignored; it is part of the submission (proof of Kiro usage).
