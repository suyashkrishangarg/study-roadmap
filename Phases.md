# Phases — Build Order

AI cannot build everything at once. Each phase ends with a working, deployable app. Do not start a phase until the previous one is complete and verified.

## Phase 0 — Setup (prerequisite)
- [x] `npx create-next-app` (TypeScript, Tailwind v4, App Router, src/ directory) — Next.js 16.4 + React 19.3
- [x] Push to GitHub; connect Vercel Git integration — pushed to `suyashkrishangarg/study-roadmap` (main); Vercel Git integration connected by user
- [x] Create Neon project via Vercel Marketplace; verify `DATABASE_URL` injection — Neon project `ep-damp-sky-b3te2ik4` created; pooled `DATABASE_URL` auto-injected on Vercel; local `.env`/`.env.local` use the **unpooled** URL (migrations can't run through pgbouncer) — **password still needs to be pasted in**
- [x] Install deps: `prisma @prisma/client @neondatabase/serverless next-auth@beta recharts apexcharts react-apexcharts motion @phosphor-icons/react` (+ `geist`, `clsx`, `tailwind-merge`; prisma pinned to `6.19.3` — v8 RC replaced the classic CLI)
- [x] `prisma migrate dev` with the full schema from Architecture.md — migration `20261007223051_init` applied to Neon `neondb` (18 tables + 10 enums); client regenerated
- [x] Env vars in `.env.local`: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY` — all set locally AND on Vercel (Production + Preview, via `scripts/import-vercel-env.ps1`); DATABASE_URL auto-injected by Neon integration. **Phase 0 complete.**

## Phase 1 — Core (planning + attendance + tracking + charts)
- [x] Auth.js Google provider; sign-in page; session callback; invite-code join; User.role — Google OAuth wired (`src/lib/auth.ts`), sign-in at `/sign-in`, first sign-in bootstraps the workspace + makes that user owner, later users join via 8-char invite code (`JoinWorkspaceForm`), session re-reads role/workspaceId from DB on every request
- [x] `lib/authz.ts`: `requireAdmin()`, `canEdit()` — plus `requireMember()`; all return typed `{ ok, data } | { ok, error }` results per Rules.md
- [ ] Dashboard: today view — due tasks, streak counter, check-in button, goal rings, mini charts (shell + invite-code card shipped; today view data next)
- [ ] Roadmaps: CRUD, items with start/end dates, assignee, status, progress bar
- [ ] Gantt timeline view (draggable bars to reschedule items)
- [ ] Tasks: CRUD, filters (due/priority/assignee), deadline badges
- [ ] Calendar feed of deadlines/events
- [ ] Attendance: daily check-in (subject + duration), calendar + heatmap, streaks
- [ ] Study goals: daily/weekly minute targets, progress rings, completion stats
- [ ] Charts: Recharts (weekly minutes bar/area, task-completion trend, goal progress)
- [ ] **Gate**: deploy to Vercel; a friend can sign in, join, check in, create a roadmap + task, see charts.

## Phase 2 — Quizzes + AI + notifications
- [ ] Quiz engine: create (manual / template / AI), take, auto-grade, attempt history, per-topic accuracy
- [ ] Practice-question bank: CRUD, filter by topic/difficulty, mark mastered
- [ ] AI teaching assistant: streaming chat (`streamText`) with workspace-subject + user-history context
- [ ] AI quiz generation from a topic/notes; AI flashcard generation (per-user daily cap)
- [ ] In-app notifications: bell icon, unread badges (deadline approaching, marathon starting, quiz graded)
- [ ] **Gate**: deploy; a friend can take a quiz, chat with the assistant, get notifications.

## Phase 3 — Marathons + SRS + advanced analytics
- [ ] Exam-prep marathons: scheduled events (live timer, per-member minutes, leaderboard, completion rate)
- [ ] On-demand focus timer (counts toward goals)
- [ ] SRS flashcards: SM-2 scheduler, due queue, retention stats
- [ ] Advanced analytics: subject-mastery radar (ApexCharts), retention curves, leaderboard, badges/streaks
- [ ] ApexCharts multi-Y-axis "polygraph" (minutes vs tasks vs quiz scores)
- [ ] **Gate**: deploy; full end-to-end pass (invite → join → check in → roadmap → task → goal → quiz → AI chat → marathon → analytics).

## Phase 4 (optional, post-launch)
- Email reminders (Resend), PDF → AI decks (Vercel Blob), custom domain, PWA polish.
