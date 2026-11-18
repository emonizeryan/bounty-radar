/* Bounty Radar — vanilla JS. No keys, no backend, no tracking.
   Data: curated snapshot (data/bounties.json) + live make.fun board fetch. */
"use strict";

const state = { bounties: [], verdict: "ALL", source: "ALL", query: "", sort: "score", liveOk: false };

function verdictOf(score) { return score >= 70 ? "GO" : score >= 30 ? "LOTTERY" : "NO-GO"; }

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function fmtDeadline(iso) {
  if (!iso) return "ongoing";
  const d = new Date(iso);
  return isNaN(d) ? "ongoing" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function fmtCountdown(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const now = new Date();
  const msLeft = d - now;
  if (msLeft < 0) return "ended";
  const daysLeft = Math.floor(msLeft / (86400 * 1000));
  const hoursLeft = Math.floor((msLeft % (86400 * 1000)) / (3600 * 1000));
  if (daysLeft > 0) return daysLeft + "d left";
  if (hoursLeft > 0) return hoursLeft + "h left";
  return "closes today";
}

function fmtPrize(b) { return b.prize || "—"; }

async function loadSnapshot() {
  const res = await fetch("data/bounties.json");
  if (!res.ok) throw new Error("snapshot fetch failed: " + res.status);
  const doc = await res.json();
  state.snapshotDate = doc.snapshotDate;
  state.snapshotNote = doc.source;
  return doc.bounties.map(normalizeSnapshot);
}

function normalizeSnapshot(b) {
  return {
    id: b.id, name: b.name, source: b.source, url: b.url,
    score: b.score, verdict: b.verdict || verdictOf(b.score),
    prize: b.prize, prizeUsd: b.prizeUsd ?? null,
    fee: b.fee, kyc: b.kyc, deadline: b.deadline, why: b.why,
    scores: b.scores || null, provenance: "snapshot", snapshotDate: b.snapshotDate,
  };
}

/* make.fun public board API — no key needed for the competitions list. */
async function loadLiveMakefun() {
  try {
    const res = await fetch("https://make.fun/api/competitions?limit=50");
    if (!res.ok) return [];
    const doc = await res.json();
    const items = doc.items || doc.competitions || [];
    return items
      .filter(c => (c.status || "open") === "open")
      .map(c => {
        const pool = c.potUsd ? parseFloat(c.potUsd) : (c.prize_pool_usd ?? c.prizePoolUsd ?? c.rewardAmount ?? null);
        const score = pool ? Math.min(65, 30 + Math.round(Math.log10(pool + 1) * 10)) : 45;
        return {
          id: "makefun-" + (c.slug || c.id),
          name: "make.fun: " + (c.title || c.slug || c.id),
          source: "make.fun", url: "https://make.fun/c/" + (c.slug || c.id),
          score, verdict: verdictOf(score),
          prize: pool ? "$" + Number(pool).toLocaleString() + " pool" : "prize pool",
          prizeUsd: pool, fee: "$0", kyc: "none (crypto payout)",
          deadline: c.deadline || null,
          why: "Live from the make.fun board. Score is provisional (pool size + open status only).",
          scores: null, provenance: "live", snapshotDate: null,
        };
      });
  } catch (e) { return []; }
}

function visibleBounties() {
  const q = state.query.trim().toLowerCase();
  let list = state.bounties.filter(b =>
    (state.verdict === "ALL" || b.verdict === state.verdict) &&
    (state.source === "ALL" || b.source === state.source) &&
    (!q || (b.name + " " + (b.why || "")).toLowerCase().includes(q)));
  const by = {
    score: (a, b) => b.score - a.score,
    deadline: (a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity),
    prize: (a, b) => (b.prizeUsd ?? -1) - (a.prizeUsd ?? -1),
  }[state.sort];
  return list.sort(by);
}

function subscoreRows(b) {
  if (!b.scores) return "<p class=\"meta\">Score breakdown not available for live entries (provisional score).</p>";
  const max = { fee: 20, payout: 20, kyc: 15, eligibility: 15, freshness: 30 };
  return Object.entries(b.scores).map(([k, v]) =>
    `<div class="subscore"><span>${esc(k)}</span><span class="bar"><div style="width:${Math.round(v / max[k] * 100)}%"></div></span><span>${v}/${max[k]}</span></div>`
  ).join("");
}

function cardHtml(b) {
  const prov = b.provenance === "live"
    ? `<span class="badge live">LIVE</span>`
    : `<span class="badge source">snapshot ${esc(b.snapshotDate || "")}</span>`;
  return `<article class="card" data-id="${esc(b.id)}" tabindex="0" aria-expanded="false">
    <h2>${esc(b.name)}</h2>
    <div class="badges">
      <span class="badge ${b.verdict}">${b.verdict} · ${b.score}</span>
      <span class="badge source">${esc(b.source)}</span>${prov}
    </div>
    <div class="scorebar"><div class="${b.verdict}" style="width:${b.score}%"></div></div>
    <p class="meta">Prize: <b>${esc(fmtPrize(b))}</b> · Fee: <b>${esc(b.fee)}</b> · KYC: <b>${esc(b.kyc)}</b></p>
    <p class="meta">Deadline: <b>${esc(fmtDeadline(b.deadline))}</b>${b.deadline ? ` · <b>${esc(fmtCountdown(b.deadline))}</b>` : ""}</p>
    <p class="why">${esc(b.why)}</p>
    <a href="${esc(b.url)}" target="_blank" rel="noopener">Official page ↗</a>
    <button class="ai-btn" data-ai="${esc(b.id)}" type="button">✨ Ask AI — is it worth it?</button>
    <p class="ai-out" hidden></p>
    <div class="detail" hidden>${subscoreRows(b)}</div>
  </article>`;
}

/* SLAY HACKS 2026 adaptation: per-card AI explainer via the free public
   Pollinations text API (no key). Fails gracefully — the board never breaks.
   The 0–100 score stays a deterministic heuristic; only this text is AI. */
const AI_FAIL = "AI explainer unavailable right now — the score breakdown below is still accurate.";

async function askAI(b, btn, out) {
  btn.disabled = true;
  btn.textContent = "Thinking…";
  out.hidden = false;
  out.textContent = "Asking the AI…";
  const prompt = `In 2 short sentences, explain why this bounty is or isn't worth a zero-capital hunter's time: ${b.name}, score ${b.score}/100 (${b.verdict}), prize ${b.prize}, fee ${b.fee}, KYC ${b.kyc}, deadline ${fmtDeadline(b.deadline)}.`;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    const res = await fetch("https://text.pollinations.ai/" + encodeURIComponent(prompt), { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = (await res.text()).trim();
    if (!text) throw new Error("empty reply");
    out.innerHTML = `<span class="ai-label">AI-generated explanation (Pollinations, free public API) — may be inaccurate:</span> ${esc(text)}`;
  } catch (e) {
    out.textContent = AI_FAIL;
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Ask AI — is it worth it?";
  }
}

function render() {
  const list = visibleBounties();
  const board = document.getElementById("board");
  board.innerHTML = list.length ? list.map(cardHtml).join("")
    : `<p class="empty">No bounties match these filters. Try clearing the search or picking All.</p>`;
  const counts = { GO: 0, LOTTERY: 0, "NO-GO": 0 };
  let pool = 0;
  for (const b of state.bounties) { counts[b.verdict] = (counts[b.verdict] || 0) + 1; if (b.prizeUsd) pool += b.prizeUsd; }
  document.getElementById("stats").innerHTML =
    `<span class="stat"><b>${counts.GO}</b> GO</span>` +
    `<span class="stat"><b>${counts.LOTTERY}</b> LOTTERY</span>` +
    `<span class="stat"><b>${counts["NO-GO"]}</b> NO-GO</span>` +
    `<span class="stat">Cash pool on board: <b>$${pool.toLocaleString()}</b></span>` +
    `<span class="stat">${state.bounties.length} bounties</span>`;
  document.getElementById("live-note").textContent = state.liveOk
    ? "✓ make.fun board is live."
    : "Live make.fun data unavailable — showing the snapshot only.";
  document.getElementById("provenance").textContent =
    `Snapshot data: ${state.snapshotDate || "?"} (${state.snapshotNote || ""}). Live entries are fetched from the public make.fun API at load time.`;
}

function bind() {
  document.getElementById("verdict-chips").addEventListener("click", e => {
    const btn = e.target.closest("button[data-verdict]");
    if (!btn) return;
    state.verdict = btn.dataset.verdict;
    document.querySelectorAll("#verdict-chips .chip").forEach(c => c.classList.toggle("active", c === btn));
    render();
  });
  document.getElementById("source-filter").addEventListener("change", e => { state.source = e.target.value; render(); });
  document.getElementById("search").addEventListener("input", e => { state.query = e.target.value; render(); });
  document.getElementById("sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
  document.getElementById("board").addEventListener("click", e => {
    const aiBtn = e.target.closest(".ai-btn");
    if (aiBtn) {
      const card = aiBtn.closest(".card");
      const b = state.bounties.find(x => x.id === aiBtn.dataset.ai);
      if (b && card) askAI(b, aiBtn, card.querySelector(".ai-out"));
      return;
    }
    const card = e.target.closest(".card");
    if (!card || e.target.closest("a")) return;
    const detail = card.querySelector(".detail");
    if (detail) {
      detail.hidden = !detail.hidden;
      card.setAttribute("aria-expanded", !detail.hidden);
    }
  });
  document.getElementById("board").addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest("button, a")) return; // buttons/links handle their own keys
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    const detail = card.querySelector(".detail");
    if (detail) {
      detail.hidden = !detail.hidden;
      card.setAttribute("aria-expanded", !detail.hidden);
    }
  });
}

async function init() {
  try { state.bounties = await loadSnapshot(); }
  catch (e) {
    document.getElementById("board").innerHTML = `<p class="empty">Could not load the bounty data. Check that data/bounties.json exists next to index.html.</p>`;
    return;
  }
  const live = await loadLiveMakefun();
  state.liveOk = live.length > 0;
  const seen = new Set(state.bounties.map(b => b.id));
  for (const b of live) if (!seen.has(b.id)) state.bounties.push(b);
  bind();
  render();
}

document.addEventListener("DOMContentLoaded", init);
