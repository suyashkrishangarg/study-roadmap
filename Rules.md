# Rules — Boundaries for the AI

## Must Use
- Next.js App Router, TypeScript strict mode, React Server Components by default; `"use client"` only for interactivity.
- Tailwind v4 + shadcn/ui for all UI primitives. One design system per project — never mix systems.
- Prisma + Neon (pooled connection string) for all data. No raw SQL strings in components.
- Auth.js v5 for auth. Google OAuth only.
- Vercel AI SDK for all AI calls, server-side only (Route Handlers / Server Actions).
- Recharts for standard charts; ApexCharts for multi-Y-axis / radar / retention plots.
- Motion (`motion/react`) for animation; Phosphor (`@phosphor-icons/react`) for icons (strokeWidth 1.5).
- `next/font` for fonts. Never `<link>` Google Fonts in production.
- CSS Grid for layouts. `min-h-[100dvh]` (never `h-screen`). Standard breakpoints (sm/md/lg/xl/2xl).

## Must Avoid
- Inter as the default font (use Geist or another sans from Design.md). Serif only if Design.md justifies it.
- AI-purple gradients, neon glows, glassmorphism-by-default, pure `#000000` / `#ffffff` (use zinc-950 / zinc-50).
- Hand-rolled SVG icons; mixing icon families; emojis in UI.
- `window.addEventListener("scroll", ...)`, `useState` for continuous values (mouse/scroll/pointer) — use Motion values / `useScroll` / IntersectionObserver.
- Placeholder comments, TODO stubs, or half-finished output — ship complete, working code.
- Animating anything other than `transform` and `opacity`.

## Authorization (hard rules)
- Every mutation Server Action MUST call `requireAdmin()` or `canEdit(item, user)` first. No exceptions.
- Edit/delete rights: author of the item, or admin/owner. Creation: any member. Admin-only: workspace settings, invite code, role changes.
- Never trust client-supplied userId — derive it from the session.

## Error Handling
- Server Actions return typed results: `{ ok: true, data } | { ok: false, error: string }`. Never throw raw errors to the client.
- Show inline form errors below inputs; transient failures via toast; loading skeletons matching final layout shape; compose empty states with a call to action.
- AI failures: graceful fallback message, retry affordance, per-user daily generation cap enforced server-side.
- Log server-side (console/observability); never leak stack traces or API keys to the client.

## Quality Gates (pre-flight, before declaring done)
- `npm run build` passes; `npm run lint` clean; TypeScript strict with no errors.
- WCAG AA contrast on all text, buttons, form inputs, focus rings — in BOTH light and dark mode.
- Every button label fits on one line at desktop; one label per intent (no duplicate CTAs).
- Mobile collapse declared explicitly per multi-column component.
- Lighthouse: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Run the `web-design-guidelines` skill review on changed UI files before shipping.

## Scope Discipline
- Implement only what the current phase (Phases.md) specifies. Do not build ahead.
- Do not add new dependencies without checking `package.json` first and stating the install command.
- Do not change the data model without updating `prisma/schema.prisma` + a migration.
