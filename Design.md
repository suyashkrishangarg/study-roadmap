# Design — Visual Language

Governed by the installed `design-taste-frontend` (taste-skill v2) and `web-design-guidelines` skills. This file is the project-specific design read; the skills supply the enforcement rules.

## Design Read
"Reading this as: a study dashboard for a small friend group, with a calm Linear-style minimalist language, leaning toward shadcn/ui + Geist + restrained motion."

## Dials (taste-skill)
- `DESIGN_VARIANCE: 5` — clean, mostly symmetric dashboards; asymmetry only in the analytics/hero moments.
- `MOTION_INTENSITY: 4` — fluid CSS transitions, scroll-reveal on sections, spring hover physics. No scroll-hijack, no marquees.
- `VISUAL_DENSITY: 6` — a data app: dense but breathable; plain-layout metrics, 1px dividers over heavy cards.

## Typography
- **Sans**: Geist (via `next/font/local` or `@vercel/geist-font`), with Geist Mono for numbers/timestamps.
- **Scale**: display `text-4xl md:text-5xl tracking-tighter`; section heads `text-2xl`; body `text-base leading-relaxed max-w-[65ch]`; captions `text-sm text-muted-foreground`.
- No serif anywhere (not an editorial/luxury brief). No Inter.

## Color
- **Mode**: dark-first with light mode toggle; respect `prefers-color-scheme`; shadcn CSS-variable tokens (`--background`, `--foreground`, `--accent`, …).
- **Neutrals**: zinc scale. Backgrounds: zinc-950 (dark) / zinc-50 (light). Never pure black/white.
- **Accent (one, locked)**: emerald (`#10b981`-family, saturation < 80%) for primary actions, streaks, "present" states. Secondary data colors: sky, amber, rose — used only in charts, never as CTAs.
- **Chart palettes** map to the same tokens so light/dark both work.

## Shape & Elevation
- Radius scale: `rounded-lg` (8px) cards/inputs, `rounded-full` pills/avatars. One scale, everywhere.
- Elevation: 1px borders (`border-zinc-800` / `border-zinc-200`) and tinted shadows (shadow hue = background hue). No pure-black drop shadows.

## Components
- shadcn/ui primitives for buttons, inputs, dialogs, tabs, toasts, badges, progress.
- Charts: Recharts wrappers (`components/charts/`) for bar/area/line; ApexCharts for multi-Y-axis, radar, heatmap-style retention.
- Activity heatmap: GitHub-style CSS grid, emerald intensity scale.
- Gantt: CSS-grid timeline, draggable item bars, today-line marker.
- Timer: circular progress ring (SVG), spring-animated.

## Motion
- Motion (`motion/react`), spring physics (`stiffness: 100, damping: 20`), `whileInView` reveals with `viewport={{ once: true }}`.
- All motion gated behind `prefers-reduced-motion` via `useReducedMotion()`.
- Animate only `transform` and `opacity`.

## Icons
- Phosphor (`@phosphor-icons/react`), `strokeWidth={1.5}`, one family project-wide.

## Accessibility
- WCAG AA contrast minimum (AAA target for hero copy) in both modes; visible focus rings; keyboard-navigable Gantt/timer; semantic headings; alt text on any imagery.

## Anti-Slop Checklist (from taste-skill)
- Max 1 accent color, locked page-wide. No AI-purple gradients, no neon glows, no glassmorphism-by-default.
- No emojis in UI. No hand-rolled SVG icons. No `h-screen` (use `min-h-[100dvh]`).
- One label per CTA intent. Button text fits one line at desktop.
- Loading skeletons, composed empty states, and inline error states for every interactive surface.
