# PaisaCoach

Your lifetime money coach — made for India. PaisaCoach takes a complete beginner from
*"where does my money go?"* to a confident, diversified investor through a 7-level journey
that unlocks with **real financial behavior**, not just reading.

## What it does

- **Track** — expenses and income in 5 seconds (keypad sheet, India merchant auto-categorization, bank-statement import)
- **Budget** — per-category monthly limits, commitments (bills + EMIs + subscriptions), safe-to-spend hero
- **Learn** — 7 levels × 3 lessons with quizzes, interactive calculators (50/30/20, emergency fund, SIP compounding) and real-world actions; levels unlock when your actual numbers move
- **Invest** — manual portfolio tracking (SIP/MF/stocks/PPF/NPS/FD/gold), allocation donut, net worth, goals; gated until the journey says you're ready
- **Coach** — AI mentor chat that knows your full financial picture, plus AI weekly reviews with a Win and a Focus

PaisaCoach never executes trades and never recommends specific funds or stocks — education, not SEBI-registered advice.

## Stack

React 19 · Vite · react-router · TanStack Query · Tailwind v4 + custom "Aurora" design system ·
framer-motion · Supabase (Postgres + Auth + Edge Functions) · OpenAI (swap to Anthropic via `LLM_PROVIDER`)

## Setup

```bash
npm install
cp .env.example .env.local   # add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

Database: apply `supabase/migrations/*.sql` in order (Supabase SQL editor or `supabase db push`).
Edge functions: deploy `ai-chat`, `ai-suggest`, `weekly-review`, `parse-bank-statement`,
`auto-log-recurring` with secrets `OPENAI_API_KEY` (or `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (auto-deployed by Cloudflare Pages on push to `main`)
- `npm run lint` — eslint
- `npm run test:e2e` — Playwright suite against a fully mocked backend (no credentials needed)

## Journey content

Curriculum lives in `src/content/journey/` as versioned JS modules — edit lessons there.
Unlock criteria are pure functions in `src/lib/journey/criteria.js` over the finance snapshot
(`src/lib/journey/snapshot.js`).
