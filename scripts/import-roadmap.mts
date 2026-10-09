/**
 * import-roadmap.mts — one-time (idempotent) importer for Suyash's Master Plan.
 *
 * Reads:
 *   - C:/Users/suyash/Downloads/roadmap/resources.json  (298 resources)
 *   - C:/Users/suyash/Downloads/roadmap/MASTER_PLAN.md   (dual-track plan)
 *
 * Writes into the FIRST workspace (the owner's workspace):
 *   - Resource            (all 298, metadata only)        [upsert by sourceIndex]
 *   - Roadmap             (one per Track x Phase, ~11)     [delete+recreate]
 *   - RoadmapItem         (each Step / table row)          [+ resourceLinks]
 *   - Task                (only for 🚀 Projects + phase checkpoints)
 *
 * Re-runnable: prior imported roadmaps (matched by title) and their
 * descendant tasks are removed before recreation.
 *
 * Run:  node scripts/import-roadmap.mts [--start=YYYY-MM-DD] [--dry-run]
 */

import { readFileSync } from "node:fs";
import { PrismaClient, ResourceType, ResourceLevel, Priority } from "@prisma/client";

const RESOURCES_PATH = "C:/Users/suyash/Downloads/roadmap/resources.json";
const PLAN_PATH = "C:/Users/suyash/Downloads/roadmap/MASTER_PLAN.md";

const MAX_LINKS_PER_ITEM = 10;
const TAIL_WEEK_SHIFT = 25;

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const startArg = args.find((a) => a.startsWith("--start="));
  return { dryRun, start: startArg ? startArg.slice("--start=".length) : null };
}

function nextMonday(from: Date): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const dow = d.getUTCDay();
  const add = dow === 1 ? 7 : (8 - dow) % 7 || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d.getTime());
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

function weekRange(a: number, b: number, anchor: Date) {
  const start = addDays(anchor, (a - 1) * 7);
  const end = addDays(anchor, b * 7 - 1);
  return { start, end };
}

type ResourceMeta = {
  sourceIndex: number;
  title: string;
  url: string;
  type: ResourceType;
  source: string;
  group: string;
  rank: number;
  level: ResourceLevel;
  durationMin: number | null;
};

const VALID_TYPES = new Set<string>(["video", "playlist", "website", "channel", "link"]);
const VALID_LEVELS = new Set<string>(["Beginner", "Intermediate", "Advanced"]);

function loadResources(): Map<number, ResourceMeta> {
  const raw = JSON.parse(readFileSync(RESOURCES_PATH, "utf8"));
  const map = new Map<number, ResourceMeta>();
  const durByIndex = new Map<number, number>();
  for (const g of raw.groups ?? []) {
    for (const r of g.resources ?? []) {
      if (r.source_index != null && typeof r.total_seconds === "number") {
        durByIndex.set(r.source_index, Math.round(r.total_seconds / 60));
      }
    }
  }
  for (const r of raw.resource_index ?? []) {
    if (!VALID_TYPES.has(r.type) || !VALID_LEVELS.has(r.level)) continue;
    if (typeof r.source_index !== "number") continue;
    map.set(r.source_index, {
      sourceIndex: r.source_index,
      title: String(r.title).slice(0, 300),
      url: String(r.url),
      type: r.type as ResourceType,
      source: String(r.source ?? "unknown"),
      group: String(r.group ?? "Uncategorized"),
      rank: typeof r.rank === "number" ? r.rank : 0,
      level: r.level as ResourceLevel,
      durationMin: durByIndex.get(r.source_index) ?? null,
    });
  }
  return map;
}

type SeedItem = {
  title: string;
  description: string;
  weekStart: number;
  weekEnd: number;
  links: number[];
  project?: { num: string; name: string; milestone: string };
  checkpoint?: { label: string; checklist: string[] };
};
type SeedRoadmap = {
  title: string;
  description: string;
  color: string;
  weekStart: number;
  weekEnd: number;
  items: SeedItem[];
};

function extractRefs(text: string): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  const re = /\[#(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const n = Number(m[1]);
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

function cleanText(s: string): string {
  return s
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseWeeks(cell: string): [number, number] | null {
  const m = cell.match(/(\d+)\s*[–—-]\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2])];
  const single = cell.match(/(\d+)/);
  if (single) {
    const n = Number(single[1]);
    return [n, n];
  }
  return null;
}

const TRACK_COLORS: Record<string, string> = {
  A: "#3b82f6",
  B: "#10b981",
  ML: "#8b5cf6",
  RL: "#f59e0b",
  LLM: "#ec4899",
};

function parsePlan(): SeedRoadmap[] {
  const text = readFileSync(PLAN_PATH, "utf8");
  const lines = text.split(/\r?\n/);

  const sectionStarts: { line: number; track: "A" | "B"; kind: "steps" | "table"; slug: string; raw: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+\S+\s+TRACK\s+([AB])\s+—\s+(.*)$/);
    if (!m) continue;
    const track = m[1] as "A" | "B";
    const rest = m[2];
    let kind: "steps" | "table" = "steps";
    let slug = "";
    const low = rest.toLowerCase();
    // Tail curriculum sections are table-based and say "(follows ...)".
    if (/follows/.test(low)) {
      kind = "table";
      if (/classical ml/.test(low)) slug = "ML";
      else if (/reinforcement learning/.test(low)) slug = "RL";
      else if (/llm systems/.test(low)) slug = "LLM";
    }
    sectionStarts.push({ line: i, track, kind, slug, raw: rest });
  }

  const phaseWeeks: Record<string, [number, number]> = {
    "Phase 0": [1, 14],
    "Phase 1": [15, 33],
    "Phase 2": [34, 47],
    "Phase 3": [48, 65],
  };

  const roadmaps: SeedRoadmap[] = [];

  for (let s = 0; s < sectionStarts.length; s++) {
    const sec = sectionStarts[s];
    const bodyStart = sec.line + 1;
    const bodyEnd = s + 1 < sectionStarts.length ? sectionStarts[s + 1].line : lines.length;
    const body = lines.slice(bodyStart, bodyEnd).join("\n");

    let title: string;
    let description = "";
    let color: string;
    let baseRange: [number, number];
    const shift = sec.kind === "table" ? TAIL_WEEK_SHIFT : 0;

    if (sec.kind === "steps") {
      const phaseMatch = sec.raw.match(/Phase\s*(\d)/i);
      const phaseKey = phaseMatch ? `Phase ${phaseMatch[1]}` : "Phase 0";
      baseRange = phaseWeeks[phaseKey] ?? [1, 14];
      const label = sec.raw.replace(/\(Steps[^)]*\)/i, "").trim();
      title = `Track ${sec.track} — ${label}`;
      color = TRACK_COLORS[sec.track];
    } else {
      baseRange = [66, 66];
      const name =
        sec.slug === "ML" ? "Classical ML" : sec.slug === "RL" ? "Reinforcement Learning" : "LLM Systems Engineering";
      title = `Track B — ${name}`;
      color = TRACK_COLORS[sec.slug];
    }

    const items: SeedItem[] = [];

    if (sec.kind === "steps") {
      const bodyLines = body.split("\n");
      const stepBlocks: { header: string; lines: string[] }[] = [];
      let cur: { header: string; lines: string[] } | null = null;
      for (const ln of bodyLines) {
        const hm = ln.match(/^###\s+Step\s+(\d+)\s+—\s+(.*)$/);
        if (hm) {
          if (cur) stepBlocks.push(cur);
          cur = { header: `Step ${hm[1]} — ${hm[2].trim()}`, lines: [] };
        } else if (cur) {
          cur.lines.push(ln);
        }
      }
      if (cur) stepBlocks.push(cur);

      const n = stepBlocks.length || 1;
      const [ws, we] = baseRange;
      const total = we - ws + 1;
      const per = total / n;

      // Track + phase label for readable checkpoint task names.
      const phaseMatch2 = sec.raw.match(/Phase\s*(\d)/i);
      const phaseLabel = phaseMatch2 ? `Phase ${phaseMatch2[1]}` : "Phase 0";

      stepBlocks.forEach((blk, idx) => {
        const bodyText = blk.lines.join("\n").trim();
        const a = ws + Math.floor(idx * per);
        const b = Math.max(a, ws + Math.floor((idx + 1) * per) - 1);
        const clean = cleanText(bodyText);
        const refs = extractRefs(bodyText);

        // ── Project detection: marker may be in the header OR the body. ──
        // e.g. header: "Step 35 — 🚀 PROJECT #4 + Classical ML Stage 0 begins"
        //      body:   "- **🚀 PROJECT #1 — "Python Toolkit":** ..."
        let project: { num: string; name: string; milestone: string } | undefined;
        const projHeader = blk.header.match(/🚀\s*PROJECT\s*#?(\d+)/i);
        const projBody = bodyText.match(/🚀\s*PROJECT\s*#?(\d+)\s*[—–+-]\s*"([^"]+)"/i);
        if (projBody) {
          const milestoneMatch = bodyText.match(/\*\*Milestone:?\*\*:?\s*([\s\S]*?)(?:\n\s*[-*]|\n\s*\n|$)/i);
          const milestone = milestoneMatch ? cleanText(milestoneMatch[1]) : "";
          project = { num: projBody[1], name: projBody[2], milestone };
        } else if (projHeader) {
          // Header form (e.g. "PROJECT #3 — "Algorithm Visualizer + Notebook"")
          const nameMatch =
            blk.header.match(/🚀\s*PROJECT\s*#?\d+\s*[—–+-]\s*"([^"]+)"/i) ??
            bodyText.match(/🚀\s*PROJECT\s*#?\d+\s*[—–+-]\s*"([^"]+)"/i);
          const milestoneMatch = bodyText.match(/\*\*Milestone:?\*\*:?\s*([\s\S]*?)(?:\n\s*[-*]|\n\s*\n|$)/i);
          const milestone = milestoneMatch ? cleanText(milestoneMatch[1]) : "";
          if (nameMatch) {
            project = { num: projHeader[1], name: nameMatch[1], milestone };
          }
        }

        // ── Checkpoint detection: a step whose header mentions "checkpoint". ──
        // Notes become ONLY the "[ ]" checklist lines (clean, not the whole step).
        let checkpoint: { label: string; checklist: string[] } | undefined;
        if (/checkpoint/i.test(blk.header)) {
          const checklist = bodyText
            .split("\n")
            .map((l) => l.match(/^\s*[-*]?\s*\[[ xX]\]\s*(.+)$/))
            .filter((m): m is RegExpMatchArray => Boolean(m))
            .map((m) => m[1].trim());
          const shortTitle = blk.header.replace(/^Step\s+\d+\s+—\s+/, "").replace(/\(Track [AB]\)/i, "").trim();
          checkpoint = {
            label: `Checkpoint · ${phaseLabel} (Track ${sec.track}): ${shortTitle}`,
            checklist,
          };
        }

        items.push({
          title: blk.header,
          description: clean,
          weekStart: a,
          weekEnd: b,
          links: refs.slice(0, MAX_LINKS_PER_ITEM),
          project,
          checkpoint,
        });
      });

      const firstStepIdx = bodyLines.findIndex((l) => /^###\s+Step/.test(l));
      const introLines = (firstStepIdx >= 0 ? bodyLines.slice(0, firstStepIdx) : [])
        .filter((l) => l.trim() && !l.startsWith(">"))
        .join(" ");
      description = cleanText(introLines).slice(0, 500);
    } else {
      const tlines = body.split("\n");
      let headerIdx = -1;
      for (let i = 0; i < tlines.length; i++) {
        if (/^\|\s*Weeks\s*\|/.test(tlines[i])) {
          headerIdx = i;
          break;
        }
      }
      let minW = Infinity;
      let maxW = -Infinity;
      if (headerIdx >= 0) {
        for (let i = headerIdx + 2; i < tlines.length; i++) {
          const row = tlines[i];
          if (!row.trim().startsWith("|")) break;
          const cells = row.split("|").slice(1, -1).map((c) => c.trim());
          if (cells.length < 3) continue;
          const wk = parseWeeks(cells[0]);
          if (!wk) continue;
          const a = wk[0] + shift;
          const b = wk[1] + shift;
          minW = Math.min(minW, a);
          maxW = Math.max(maxW, b);

          const stage = cleanText(cells[1]);
          const colC = cells[2] ?? "";
          const colD = cells[3] ?? "";
          const colE = cells[4] ?? "";

          let descriptionText: string;
          let linkSource: string;
          if (sec.slug === "LLM") {
            descriptionText = [
              colC && colC !== "—" ? `Output: ${cleanText(colC)}` : "",
              colE && colE !== "—" ? `Track A support: ${cleanText(colE)}` : "",
            ]
              .filter(Boolean)
              .join("\n");
            linkSource = colD ?? "";
          } else {
            descriptionText = [
              colC && colC !== "—" ? `Do: ${cleanText(colC)}` : "",
              colE && colE !== "—" ? `Track A support: ${cleanText(colE)}` : "",
            ]
              .filter(Boolean)
              .join("\n");
            linkSource = colD ?? "";
          }

          items.push({
            title: stage,
            description: descriptionText,
            weekStart: a,
            weekEnd: b,
            links: extractRefs(linkSource).slice(0, MAX_LINKS_PER_ITEM),
          });
        }
      }
      baseRange = [minW === Infinity ? 66 : minW, maxW === -Infinity ? 66 : maxW];
    }

    if (items.length === 0) continue;

    const allA = items.map((it) => it.weekStart);
    const allB = items.map((it) => it.weekEnd);
    roadmaps.push({
      title,
      description,
      color,
      weekStart: Math.min(...allA),
      weekEnd: Math.max(...allB),
      items,
    });
  }

  return roadmaps;
}

async function main() {
  const { dryRun, start: startArg } = parseArgs();

  const anchor = startArg ? new Date(`${startArg}T00:00:00.000Z`) : nextMonday(new Date());

  const resources = loadResources();
  const roadmaps = parsePlan();

  const totalItems = roadmaps.reduce((s, r) => s + r.items.length, 0);
  const totalLinks = roadmaps.reduce((s, r) => s + r.items.reduce((t, it) => t + it.links.length, 0), 0);
  const totalProjects = roadmaps.reduce((s, r) => s + r.items.filter((it) => it.project).length, 0);
  const totalCheckpoints = roadmaps.reduce((s, r) => s + r.items.filter((it) => it.checkpoint).length, 0);

  console.log("=== PARSE SUMMARY ===");
  console.log("anchor (Week 1):", anchor.toISOString().slice(0, 10));
  console.log("resources:", resources.size);
  console.log("roadmaps:", roadmaps.length);
  for (const r of roadmaps) {
    console.log(`  - ${r.title}  [weeks ${r.weekStart}-${r.weekEnd}, ${r.items.length} items]`);
  }
  console.log("total items:", totalItems);
  console.log("total resource links (<=10/item):", totalLinks);
  console.log("project tasks:", totalProjects, "| checkpoint tasks:", totalCheckpoints);

  if (dryRun) {
    if (process.argv.includes("--debug-tasks")) {
      console.log("\n=== TASK PREVIEW ===");
      for (const r of roadmaps) {
        for (const it of r.items) {
          if (it.project) {
            console.log(`\n[PROJECT] 🚀 Project #${it.project.num}: ${it.project.name}`);
            console.log(`  notes: ${it.project.milestone ? `Done when: ${it.project.milestone}` : `Build project #${it.project.num}: ${it.project.name}`}`);
          }
          if (it.checkpoint) {
            console.log(`\n[CHECKPOINT] ${it.checkpoint.label}`);
            console.log(`  notes:\n${it.checkpoint.checklist.map((c) => `    [ ] ${c}`).join("\n") || "    (no checklist — prove without notes)"}`);
          }
        }
      }
    }
    console.log("\n[dry-run] no writes performed.");
    await prisma.$disconnect();
    return;
  }

  const workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workspace) throw new Error("No workspace found. Sign in once to bootstrap it.");
  const author =
    (await prisma.user.findFirst({
      where: { workspaceId: workspace.id, role: { in: ["owner", "admin"] } },
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.user.findFirst({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "asc" } }));
  if (!author) throw new Error("No user in workspace to attribute authorship.");

  console.log(`\nworkspace: ${workspace.id}  author: ${author.name ?? author.email}`);

  let resUpserted = 0;
  for (const r of resources.values()) {
    await prisma.resource.upsert({
      where: { sourceIndex: r.sourceIndex },
      create: { ...r, workspaceId: workspace.id },
      update: {
        title: r.title,
        url: r.url,
        type: r.type,
        source: r.source,
        group: r.group,
        rank: r.rank,
        level: r.level,
        durationMin: r.durationMin,
      },
    });
    resUpserted++;
  }
  console.log(`resources upserted: ${resUpserted}`);

  const seedTitles = roadmaps.map((r) => r.title);
  const existing = await prisma.roadmap.findMany({
    where: { workspaceId: workspace.id, title: { in: seedTitles } },
    select: { id: true, items: { select: { id: true } } },
  });
  if (existing.length > 0) {
    const itemIds = existing.flatMap((r) => r.items.map((i) => i.id));
    if (itemIds.length > 0) {
      const delTasks = await prisma.task.deleteMany({ where: { roadmapItemId: { in: itemIds } } });
      console.log(`removed ${delTasks.count} stale tasks from prior import`);
    }
    const delMaps = await prisma.roadmap.deleteMany({ where: { id: { in: existing.map((r) => r.id) } } });
    console.log(`removed ${delMaps.count} prior imported roadmaps`);
  }

  let itemsCreated = 0;
  let linksCreated = 0;
  let tasksCreated = 0;

  for (const r of roadmaps) {
    const { start, end } = weekRange(r.weekStart, r.weekEnd, anchor);
    const roadmap = await prisma.roadmap.create({
      data: {
        title: r.title,
        description: r.description || null,
        color: r.color,
        startDate: start,
        endDate: end,
        authorId: author.id,
        workspaceId: workspace.id,
      },
    });

    for (let idx = 0; idx < r.items.length; idx++) {
      const it = r.items[idx];
      const { start: iStart, end: iEnd } = weekRange(it.weekStart, it.weekEnd, anchor);
      const item = await prisma.roadmapItem.create({
        data: {
          title: it.title,
          description: it.description || null,
          startDate: iStart,
          endDate: iEnd,
          sortOrder: idx,
          authorId: author.id,
          roadmapId: roadmap.id,
        },
      });
      itemsCreated++;

      const linkData = it.links
        .filter((si) => resources.has(si))
        .map((si) => {
          const meta = resources.get(si)!;
          return { title: meta.title.slice(0, 120), url: meta.url };
        });
      if (linkData.length > 0) {
        const created = await prisma.resourceLink.createMany({
          data: linkData.map((l, i) => ({ ...l, sortOrder: i, roadmapItemId: item.id })),
        });
        linksCreated += created.count;
      }

      if (it.project) {
        const note = it.project.milestone
          ? `Done when: ${it.project.milestone}`
          : `Build project #${it.project.num}: ${it.project.name}`;
        await prisma.task.create({
          data: {
            title: `🚀 Project #${it.project.num}: ${it.project.name}`,
            notes: note,
            priority: Priority.high,
            status: "todo",
            dueDate: iEnd,
            roadmapItemId: item.id,
            authorId: author.id,
            workspaceId: workspace.id,
          },
        });
        tasksCreated++;
      }
      if (it.checkpoint) {
        const note = it.checkpoint.checklist.length
          ? it.checkpoint.checklist.map((c) => `[ ] ${c}`).join("\n")
          : "Prove this phase's skills without notes.";
        await prisma.task.create({
          data: {
            title: it.checkpoint.label,
            notes: note,
            priority: Priority.medium,
            status: "todo",
            dueDate: iEnd,
            roadmapItemId: item.id,
            authorId: author.id,
            workspaceId: workspace.id,
          },
        });
        tasksCreated++;
      }
    }
  }

  console.log("\n=== IMPORT COMPLETE ===");
  console.log(`roadmaps: ${roadmaps.length}`);
  console.log(`items: ${itemsCreated}`);
  console.log(`resource links: ${linksCreated}`);
  console.log(`tasks: ${tasksCreated}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});


