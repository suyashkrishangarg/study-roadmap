# Architecture

## Stack
- **Framework**: Next.js (App Router) + TypeScript (strict) + React Server Components.
- **Styling**: Tailwind v4 + shadcn/ui (CSS-variable theming).
- **Database**: Neon serverless Postgres (Vercel Marketplace integration; auto env-var injection; scale-to-zero with auto-wake — no pinging). Prisma ORM with pooled connection string.
- **Auth**: Auth.js v5 (`next-auth@beta`, pinned), Google OAuth provider, invite-code join.
- **AI**: Vercel AI SDK (provider-agnostic). Start with Gemini free tier (`GOOGLE_GENERATIVE_AI_API_KEY`). Streaming via Route Handlers (`streamText`). Server-side only.
- **Charts**: Recharts (standard dashboards) + ApexCharts / react-apexcharts (multi-Y-axis polygraphs, radar, retention curves).
- **Animation**: Motion (`motion/react`), spring physics, `prefers-reduced-motion` support.
- **Icons**: Phosphor (`@phosphor-icons/react`), strokeWidth 1.5.
- **Deployment**: GitHub repo → Vercel Git integration (auto-deploy on push, preview deploys per branch).

## App Flow
1. User lands → not authenticated → Google sign-in.
2. First sign-in → account created (role: member) → prompted for workspace invite code (owner/admin can regenerate it).
3. Authenticated user → Dashboard (today view) → navigate to Roadmaps / Tasks / Attendance / Goals / Quizzes / Questions / Marathons / Analytics / Assistant.
4. Every mutation goes through a Server Action that first runs `requireAdmin()` or `canEdit(item, user)`.
5. AI features call Route Handlers that call the Vercel AI SDK server-side; streams back to the client.
6. Notifications are written to the `Notification` table by Server Actions and read via the bell UI.

## Folder Structure
```
study/
├── .kilo/
│   └── skills/                      # installed agent skills
│       ├── design-taste-frontend/   # taste-skill v2 (anti-slop frontend)
│       └── web-design-guidelines/   # Vercel UI review skill
├── prisma/
│   └── schema.prisma                # data model (see PRD)
├── src/
│   ├── app/
│   │   ├── (auth)/sign-in/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx             # dashboard / today
│   │   │   ├── roadmaps/            # list + detail + Gantt view
│   │   │   ├── tasks/
│   │   │   ├── attendance/          # check-in + calendar + heatmap
│   │   │   ├── goals/
│   │   │   ├── quizzes/             # builder + take + results
│   │   │   ├── questions/           # practice bank
│   │   │   ├── marathons/           # scheduled + on-demand timer
│   │   │   ├── analytics/           # Recharts + ApexCharts
│   │   │   └── assistant/           # AI teaching assistant chat
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts     # streaming chat (streamText)
│   │   │   └── ai/generate/route.ts # quiz/flashcard generation
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── charts/                  # Recharts + ApexCharts wrappers
│   │   ├── gantt/                   # Gantt timeline
│   │   ├── heatmap/                 # activity heatmap
│   │   └── timer/                   # focus/marathon timer
│   ├── lib/
│   │   ├── auth.ts                  # Auth.js config + session helpers
│   │   ├── db.ts                    # Prisma singleton
│   │   ├── authz.ts                 # requireAdmin(), canEdit()
│   │   ├── ai.ts                    # Vercel AI SDK setup + prompts
│   │   └── srs.ts                   # SM-2 scheduler (Phase 3)
│   ├── server-actions/              # all mutations, one per domain
│   └── types/                       # shared TypeScript types
├── PRD.md  Architecture.md  Rules.md  Phases.md  Design.md  Memory.md
└── kilo.json                        # optional: skills.paths, permissions
```

## Data Model (Prisma, summary)
`Workspace` (singleton: inviteCode, settings) · `User` (role: owner|admin|member) · `Roadmap` + `RoadmapItem` (startDate/endDate for Gantt) · `Task` (priority, dueDate, assignee, authorId) · `CheckIn` (unique userId+date+subject) · `Goal` (daily|weekly, targetMin) · `Quiz` + `QuizQuestion` + `QuizAttempt` · `PracticeQuestion` · `Marathon` (scheduled|ondemand) + `MarathonSession` · `Flashcard` (SM-2 fields) · `AIMessage` · `Notification` · `ActivityEvent`.

## Environment Variables
`DATABASE_URL` (Neon pooled), `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`.

## Key Constraints
- Vercel Hobby: 10s function execution limit → keep AI generation short; stream chat.
- Neon free tier: 0.5 GB storage — fine for ~20 users; monitor.
- Gemini free tier: per-user daily generation cap in code.
