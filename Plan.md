Study Platform / Dashboard — Implementation Plan (Refined)
Context
Greenfield project: C:\Users\suyash\Downloads\study is empty. Deploy target: Vercel via GitHub Git integration (auto-deploy on push).
Users: you + a small closed group of friends. Constraints: free-tier services only, zero maintenance (no pinging/keep-alive).
Features: roadmaps, Gantt timelines, calendar feed, tasks, deadlines, daily study check-in (attendance), study goals, performance tracking with graphs/polypgraphs, quizzes, practice questions, exam-prep marathons (scheduled + on-demand), AI teaching assistant, in-app notifications, group-editable content.
Resolved Decisions
Stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui on Vercel.
Database: Neon serverless Postgres via Vercel Marketplace (auto env-var injection, scale-to-zero with auto-wake — no pinging, free 0.5 GB) + Prisma ORM. (Vercel Postgres is discontinued; Neon is its successor.)
Auth: Auth.js v5 (next-auth@beta, pin exact version), Google OAuth; join via invite code.
Workspace: single shared workspace — all signed-up users are members. Workspace singleton row holds inviteCode + settings. No per-group membership table.
Roles & edit rights: User.role = owner | admin | member. All members create content; only the author or an admin/owner can edit/delete an item. Enforce via one canEdit(item, user) helper + requireAdmin() in Server Actions.
AI: Vercel AI SDK (provider-agnostic); start with Gemini free tier (GOOGLE_GENERATIVE_AI_API_KEY). All AI calls server-side (Route Handlers with streamText); keys never reach the client.
Charts: Recharts for standard dashboards; ApexCharts (react-apexcharts) for multi-Y-axis "polygraphs" and radar/retention plots.
Attendance: daily study check-in — a day counts as "present" if any check-in exists that day. Drives streaks + GitHub-style heatmap.
Tracking: study goals — daily/weekly minute targets (global or per subject) with progress rings and completion rates.
Timelines: Gantt view of roadmap items (start/end dates, draggable to reschedule) + calendar feed of deadlines/events.
Marathons: scheduled group events (fixed start + duration, live minutes leaderboard, completion rate) AND an on-demand focus timer (anytime, counts toward goals).
Content sources: quizzes/practice questions from AI generation, manual creation, and starter templates.
Notifications: in-app only — bell icon, unread badges, Notification rows (deadline approaching, marathon starting, quiz graded). No email.
Phasing: 3 phases below.
Data Model (Prisma)
Workspace (singleton: inviteCode, name, settings JSONB)
User (id, name, email, avatar, role, createdAt)
Roadmap (id, title, description, startDate, endDate) + RoadmapItem (order, title, status, startDate, endDate, assigneeId)
Task (id, title, notes, priority, status, dueDate, assigneeId, roadmapItemId?, authorId)
CheckIn (id, userId, date, subject, durationMin, note) — unique(userId, date, subject)
Goal (id, userId, period: daily|weekly, subject?, targetMin)
Quiz (id, title, source: ai|manual|template, authorId) + QuizQuestion (type, prompt, options JSONB, answer, explanation) + QuizAttempt (userId, score, answers JSONB, startedAt, completedAt)
PracticeQuestion (id, topic, difficulty, prompt, solution, source, authorId)
Marathon (id, type: scheduled|ondemand, title, startsAt?, durationMin, goalMin) + MarathonSession (userId, minutes, startedAt, completedAt)
Flashcard (id, deckId, front, back, ease, interval, dueDate, reps) — SM-2 fields
AIMessage (id, userId, role, content, createdAt) — teaching-assistant chat history
Notification (id, userId, type, refId, readAt, createdAt)
ActivityEvent (id, userId, type, refId, createdAt) — feeds analytics
Architecture
Server Components + Server Actions for mutations; Route Handlers for AI streaming (streamText).
Authorization: requireAdmin() and canEdit(item, user) called in every mutation Server Action — prevents cross-user edits and privilege escalation.
Prisma with Neon pooled connection string for serverless.
Env vars: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, GOOGLE_GENERATIVE_AI_API_KEY.
Phase 1 — Core (planning + attendance + tracking + charts)
Scaffold: npx create-next-app (TS, Tailwind, App Router, src/). Install: prisma @prisma/client @neondatabase/serverless next-auth@beta recharts apexcharts react-apexcharts.
Create Neon project via Vercel Marketplace → DATABASE_URL auto-injected → prisma migrate.
Auth.js Google provider; session callback; sign-in page; invite-code join.
Dashboard: today view — due tasks, streak counter, check-in button, goal rings, mini charts.
Roadmaps: CRUD, items with start/end dates, assign, progress bar; Gantt view (draggable bars).
Tasks: CRUD, filters (due/priority/assignee), deadline badges; calendar feed of deadlines/events.
Attendance: daily check-in (subject + duration), calendar + heatmap view, streaks.
Study goals: daily/weekly minute targets, progress rings, completion stats.
Charts: Recharts (weekly study-minutes bar/area, task-completion trend, goal progress); ApexCharts multi-Y-axis (minutes vs tasks vs quiz scores).
Phase 2 — Quizzes + AI + notifications
Quiz engine: create (manual/template/AI), take, auto-grade, attempt history, per-topic accuracy.
Practice-question bank: CRUD, filter by topic/difficulty, mark mastered.
AI teaching assistant: streaming chat with workspace-subject + user-history context; AI quiz generation from a topic/notes; AI flashcard generation.
In-app notifications: bell + unread badges for deadlines, marathon starts, graded quizzes.
Phase 3 — Marathons + SRS + advanced analytics
Exam-prep marathons: scheduled events (live timer, per-member minutes, leaderboard, completion rate) + on-demand focus timer.
SRS flashcards: SM-2 scheduler, due queue, retention stats.
Advanced analytics: subject-mastery radar (ApexCharts), retention curves, leaderboard, badges/streaks.
Risks
Neon free tier (0.5 GB storage, compute limits) — fine for ~20 users; monitor usage.
AI cost/limits: Gemini free tier caps; add per-user daily generation cap; keep prompts tight.
Vercel Hobby 10s function limit — use Edge runtime for AI streaming; keep generation jobs short.
Auth.js v5 ships as next-auth@beta — pin exact versions.
Gantt drag-and-drop is the trickiest UI; use a small library or CSS-grid-based implementation, avoid over-engineering.
Authorization leaks: enforce requireAdmin/canEdit in every mutation.
Validation
npm run dev with .env.local; prisma migrate dev.
Push to GitHub → Vercel Git integration auto-deploys; verify Neon connectivity from Vercel env vars.
End-to-end test: invite → join → check in → create roadmap/task → set goal → take quiz → AI chat → marathon.
Lighthouse + mobile viewport check (friends will use phones; PWA manifest for installability).
Explicitly Out of Scope
Email/SMS reminders (needs Resend — Phase 3+).
PDF/file uploads → AI decks (needs Vercel Blob).
Native mobile app (PWA is sufficient initially).
Custom domain (free .vercel.app is fine initially).
Habit tracking (study goals cover the tracking need).