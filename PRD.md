# PRD — Project Requirements Document

## Product
A self-hosted-on-Vercel study platform / dashboard for a small, closed group of friends to plan, track, and gamify exam preparation together.

## Target Users
- You and your friends (≈2–20 people), preparing for exams together.
- Non-technical users: sign in with Google, join with an invite code, use it on phone or desktop (PWA).

## Goals
- One shared workspace: everyone sees the same roadmaps, tasks, deadlines, quizzes, leaderboard.
- Zero maintenance: free-tier services only, no keep-alive/pinging, serverless everything.
- Cool factor: rich graphs, multi-axis "polygraphs", streaks, heatmaps, leaderboards.

## Feature Requirements

### Phase 1 — Core
- **Auth**: Google OAuth sign-in; join workspace via invite code. Roles: owner / admin / member.
- **Dashboard**: today view — due tasks, streak counter, check-in button, goal rings, mini charts.
- **Roadmaps**: CRUD; items with start/end dates, assignee, status; progress bar; **Gantt timeline view** (draggable bars to reschedule).
- **Tasks**: CRUD; priority, due date, assignee, filters; deadline badges; **calendar feed** of deadlines/events.
- **Attendance**: daily study check-in (subject + duration). A day counts as "present" if any check-in exists that day. Streaks + GitHub-style activity heatmap.
- **Study goals**: daily/weekly minute targets (global or per subject); progress rings; completion stats.
- **Charts**: Recharts (weekly study-minutes bar/area, task-completion trend, goal progress); ApexCharts multi-Y-axis plots.

### Phase 2 — Quizzes + AI + Notifications
- **Quiz engine**: create quizzes (manual / template / AI-generated), take, auto-grade, attempt history, per-topic accuracy.
- **Practice-question bank**: CRUD, filter by topic/difficulty, mark mastered.
- **AI teaching assistant**: streaming chat with workspace-subject + user-history context; AI quiz generation from a topic/notes; AI flashcard generation.
- **In-app notifications**: bell icon, unread badges (deadline approaching, marathon starting, quiz graded).

### Phase 3 — Marathons + SRS + Advanced Analytics
- **Exam-prep marathons**: scheduled group events (fixed start + duration, live minutes leaderboard, completion rate) AND an on-demand focus timer (anytime, counts toward goals).
- **SRS flashcards**: SM-2 scheduler, due queue, retention stats.
- **Advanced analytics**: subject-mastery radar (ApexCharts), retention curves, leaderboard, badges/streaks.

## Non-Functional Requirements
- Free-tier only (Neon, Gemini, Vercel Hobby).
- Mobile-responsive; PWA-installable.
- WCAG AA contrast; dark + light mode.
- Authorization enforced server-side on every mutation (author-or-admin edit rights).
- AI keys never exposed to the client.

## Out of Scope
- Email/SMS reminders, PDF/file uploads, native mobile app, custom domain, habit tracking, multiple workspaces, private personal spaces.

## Success Criteria
- A friend can: sign in → join via invite code → check in → see the dashboard → complete a task → take a quiz → chat with the AI assistant — all without reading docs.
