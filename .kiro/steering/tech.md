# Tech steering — Bounty Radar

## Stack
- Vanilla HTML + CSS + JavaScript. No framework, no build step, no bundler, no backend, no secrets, no API keys at runtime.
- Target: any static host (GitHub Pages). `index.html` must work when opened directly or served.

## Rules
- One external request only: `GET https://make.fun/api/competitions?limit=50` (public, no key). Everything else is local.
- No tracking, no analytics, no cookies.
- No paid services anywhere. Total running cost: $0.
- Keep it small: the whole app should stay under ~1,500 lines total (HTML + CSS + JS + data).
- Deadlines are ISO 8601 with timezone offsets. Display in the viewer's local time with `toLocaleString`.
- Every bounty card links to the official source. Never link through a referral or tracking redirect.
