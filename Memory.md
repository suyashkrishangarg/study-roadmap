# Memory — Session Continuity Log

> Purpose: keep any AI (this session or a future one) up to speed without re-reading the whole codebase. Update this file at the end of every work session. One line per event, newest on top.

## Project Snapshot
- **What**: Study platform/dashboard for a small friend group, deployed on Vercel.
- **Where**: `C:\Users\suyash\Downloads\study` (GitHub → Vercel Git integration).
- **Stack**: Next.js App Router + TS strict + Tailwind v4 + shadcn/ui · Neon Postgres + Prisma · Auth.js v5 (Google OAuth) · Vercel AI SDK (Gemini free tier first) · Recharts + ApexCharts · Motion · Phosphor icons.
- **Docs**: PRD.md (requirements), Architecture.md (structure/data model), Rules.md (AI boundaries), Phases.md (build order), Design.md (visual language).
- **Skills installed**: `.kilo/skills/design-taste-frontend` (taste-skill v2), `.kilo/skills/web-design-guidelines` (Vercel UI review). Auto-discovered in any session in this folder.

## Key Decisions (locked)
- Single shared workspace; all signed-in users are members. Roles: owner/admin/member.
- Edit rights: author + admin. Creation: any member. Enforced via `lib/authz.ts` (`requireAdmin`, `canEdit`) in every Server Action.
- Attendance = daily study check-in (present if any check-in that day) → streaks + heatmap.
- Tracking = study goals (daily/weekly minute targets) with progress rings.
- Timelines = Gantt view of roadmap items + calendar feed of deadlines/events.
- Marathons = scheduled group events (leaderboard) + on-demand focus timer.
- Content = AI-generated + manual + templates. Notifications = in-app only.
- Charts = Recharts (standard) + ApexCharts (multi-Y-axis polygraphs, radar).
- **Prisma pinned to 6.19.3** (`prisma@6` + `@prisma/client@6`): the registry's `prisma@latest` is now 8.0.0-rc, whose new platform CLI dropped `generate`/`migrate dev`/`validate`. Repo docs specify the classic workflow, so we pin 6. Upgrade later via `prisma` major-version guide.
- **Phosphor icons import from `@phosphor-icons/react/ssr`**: Next 16 config collection evaluates page modules under the `react-server` condition, and React 19.3's react-server build omits `createContext` — the main entry calls it at module scope and crashes the build. The `/ssr` entry (SSRBase, prop-based defaults, no IconContext) works in server + client components. We never use IconContext.
- **Env files**: `.env` (read by the Prisma CLI) and `.env.local` (Next.js) both exist with identical placeholders, both git-ignored via `.env*`. Keep them in sync; `.env.local` wins for Next.js.
- **Geist font** via the `geist` npm package (`GeistSans`/`GeistMono` CSS variables on `<html>`); Design.md's `@vercel/geist-font` name no longer exists on npm.
- **ESLint ignores** tooling dirs (`.claude/`, `.gemini/`, `.kilo/`, `graft/`, `prisma/`) — only app source is linted.

## Progress Log
- 2026-10-07: **Phase 0 DB live.** `npx prisma migrate dev --name init` applied migration `20261007223051_init` to Neon `neondb` (18 tables + 10 enums, 313-line SQL) using the unpooled URL + real password; Prisma Client regenerated; migration committed + pushed (63abad9). `.env`/`.env.local` now hold real `DATABASE_URL` (unpooled) + `GOOGLE_GENERATIVE_AI_API_KEY`. Vercel production: `study-roadmap-one.vercel.app` + custom domain `study.ramyaai.tech` connected. **Remaining Phase 0**: `AUTH_SECRET` (`npx auth secret`), Google OAuth `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, and mirroring all four env vars into Vercel Settings → Environment Variables.
- 2026-10-07: Phase 0 nearly closed. Pushed to GitHub (`suyashkrishangarg/study-roadmap`, main, root commit 4ad8ece — 31 files). Vercel Git integration + Neon Marketplace connected by user (project `ep-damp-sky-b3te2ik4`, ap-southeast-1); pooled `DATABASE_URL` auto-injected on Vercel. Local `.env`/`.env.local` point at the **unpooled** URL (`prisma migrate dev` can't run through pgbouncer). Schema rewritten to match Plan.md exactly (18 models). `prisma validate` + `generate` pass. github.com IS reachable from this sandbox now (gh CLI authed as suyashkrishangarg).
- 2026-10-07: **Phase 0 local work complete.** Scaffolded Next.js 16.4 (TS strict, Tailwind v4, App Router, src/) via create-next-app into `study/`; installed all phase deps + `geist`/`clsx`/`tailwind-merge`; pinned prisma@6.19.3; wrote full `prisma/schema.prisma` (17 models, all enums, indexes, cascade rules) — `prisma validate` + `prisma generate` pass; design foundation shipped (globals.css shadcn tokens: zinc neutrals, emerald accent, chart palette, dark-first via `.dark` class + prefers-color-scheme script; Geist fonts; `min-h-[100dvh]`); shadcn `components.json` + `src/lib/utils.ts` (`cn`); root page with Phosphor `/ssr` icon. Quality gates: `npm run build` ✓, `npm run lint` ✓, `tsc --noEmit` ✓. `git init` done, files staged (not committed). `graft build` refreshed (8 nodes, 14 edges).
- 2026-10-07: Graft v0.21.1 set up: `npm install -g @nanonets/graft` + `graft init -y`. `graft/` created (7 files: INDEX.md + 6 cache/graph JSONs). **0 map files built** — repo has no source code yet (markdown only); run `graft build` after Phase 0 to generate real maps. Wired via AGENTS.md + .mcp.json + .claude/ + .gemini/ + GEMINI.md. Sandbox workaround: tree-sitter-kotlin binding stubbed (package ships no prebuilt binary; no C++ toolchain here) — Kotlin parsing unavailable, all other grammars fine.
- 2026-10-07: Planning complete. Skills installed. PRD/Architecture/Rules/Phases/Design written. Memory.md created. **Next: Phase 0 (scaffold, Neon, deps, prisma migrate, env vars).**

## Current Work
- Phase 0 — DB migrated and live on Neon; code pushed (3 commits). **Remaining before Phase 1**: (1) Google OAuth client → `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, (2) `npx auth secret` → `AUTH_SECRET`, (3) mirror `AUTH_SECRET` + `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` + `GOOGLE_GENERATIVE_AI_API_KEY` into Vercel → Settings → Environment Variables. Then Phase 1 (auth, dashboard, roadmaps, tasks, attendance, goals, charts).

## Blockers / Notes
- Waiting on user's Google Cloud OAuth client (browser step) + AUTH_SECRET generation.
- Neon free tier: 0.5 GB. Gemini free tier: enforce per-user daily AI generation cap in code.
- Vercel Hobby: 10s function limit — stream AI chat, keep generation jobs short.
- github.com is reachable from this sandbox now (gh CLI authed as suyashkrishangarg, https protocol).
- Production domains: `study-roadmap-one.vercel.app` + `study.ramyaai.tech` — both need OAuth redirect URIs (`/api/auth/callback/google`).

## How to Update
- Append to the Progress Log with date + one line per completed task, decision change, or blocker.
- Update "Current Work" at the start of each session; update "Project Snapshot" when stack/docs change.
