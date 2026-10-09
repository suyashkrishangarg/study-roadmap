/**
 * import-projects.mts — idempotent importer for the MASTER PROJECT REGISTRY
 * (Part 7 of roadmap/MASTER_PLAN_FIXED_RAW.md) into the Project table.
 *
 * Parses all four subsections so NO project is missed:
 *   - Track B — DSA / Python projects      (table, P1–P5)
 *   - Track B — Classical ML projects      (table, Stages 0–13)
 *   - Track B — RL projects                (prose list separated by ·)
 *   - Track B — LLM Systems projects       (table, Stages 1–12 + capstone)
 *
 * Upserts by sourceKey (preserves favorites); deletes stale rows no longer present.
 *
 * Run:  node scripts/import-projects.mts [--dry-run] [--debug]
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const PLAN_PATH = "roadmap/MASTER_PLAN_FIXED_RAW.md";

const CAT_DSA = "DSA / Python";
const CAT_ML = "Classical ML";
const CAT_RL = "Reinforcement Learning";
const CAT_LLM = "LLM Systems";

const prisma = new PrismaClient();

type SeedProject = {
  sourceKey: string;
  title: string;
  description: string | null;
  category: string;
  stageRef: string | null;
  weekWhen: string | null;
  priority: string | null;
  difficulty: string | null;
  estHours: string | null;
  dependency: string | null;
};

function cleanCell(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s+/g, " ").trim();
}

function extractBold(s: string): string | null {
  const m = s.match(/\*\*(.+?)\*\*/);
  return m ? m[1].trim() : null;
}

/** Split a markdown table body into rows of trimmed cell strings. */
function tableRows(section: string): string[][] {
  const rows: string[][] = [];
  for (const line of section.split("\n")) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;
    rows.push(cells);
  }
  return rows;
}

function parseDsa(section: string): SeedProject[] {
  const out: SeedProject[] = [];
  let idx = 0;
  for (const cells of tableRows(section)) {
    if (cells.length < 4) continue;
    const ref = cleanCell(cells[0]);
    if (!/^P\d+$/i.test(ref)) continue; // skip header/separator rows
    idx++;
    const bold = extractBold(cells[1]);
    const title = bold ?? cleanCell(cells[1]);
    // parenthetical detail after the bold name, e.g. "**Python Toolkit** (linked list, ...)"
    const detail = cells[1]
      .replace(/\*\*.*?\*\*/, "")
      .replace(/^[\s(]+|[\s)]+$/g, "")
      .trim();
    const when = cleanCell(cells[2]);
    const proves = cleanCell(cells[3]);
    const descParts: string[] = [];
    if (detail) descParts.push(detail);
    if (proves) descParts.push(`Proves: ${proves}`);
    out.push({
      sourceKey: `dsa-${idx}`,
      title,
      description: descParts.join(" — ") || null,
      category: CAT_DSA,
      stageRef: ref,
      weekWhen: when || null,
      priority: null,
      difficulty: null,
      estHours: null,
      dependency: null,
    });
  }
  return out;
}

function parseMl(section: string): SeedProject[] {
  const out: SeedProject[] = [];
  let idx = 0;
  for (const cells of tableRows(section)) {
    if (cells.length < 3) continue;
    const stage = cleanCell(cells[0]);
    if (!/^\d+$/.test(stage)) continue; // skip header/separator
    idx++;
    const title = cleanCell(cells[1]);
    const hours = cleanCell(cells[2]);
    out.push({
      sourceKey: `ml-${idx}`,
      title,
      description: null,
      category: CAT_ML,
      stageRef: `Stage ${stage}`,
      weekWhen: `Stage ${stage}`,
      priority: null,
      difficulty: null,
      estHours: hours || null,
      dependency: null,
    });
  }
  return out;
}

function parseLlm(section: string): SeedProject[] {
  const out: SeedProject[] = [];
  let idx = 0;
  for (const cells of tableRows(section)) {
    if (cells.length < 6) continue;
    const stage = cleanCell(cells[0]);
    if (!/^(\d+|—|-)$/.test(stage)) continue; // skip header/separator
    idx++;
    const title = cleanCell(cells[1]);
    const priority = cleanCell(cells[2]);
    const difficulty = cleanCell(cells[3]);
    const hours = cleanCell(cells[4]);
    const dep = cleanCell(cells[5]);
    const stageRef = /^\d+$/.test(stage) ? `Stage ${stage}` : "Capstone";
    out.push({
      sourceKey: `llm-${idx}`,
      title,
      description: null,
      category: CAT_LLM,
      stageRef,
      weekWhen: stageRef,
      priority: priority || null,
      difficulty: difficulty || null,
      estHours: hours || null,
      dependency: dep || null,
    });
  }
  return out;
}

function parseRl(section: string): SeedProject[] {
  // Prose list separated by "·". Strip heading lines, bold notes, and blank lines.
  const prose = section
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("**"))
    .join(" ")
    .trim();
  const items = prose
    .split("·")
    .map((s) => s.replace(/\s+/g, " ").trim().replace(/\.$/, "").trim())
    .filter(Boolean);
  return items.map((title, i) => ({
    sourceKey: `rl-${i + 1}`,
    title,
    description: null,
    category: CAT_RL,
    stageRef: null,
    weekWhen: null,
    priority: null,
    difficulty: null,
    estHours: null,
    dependency: null,
  }));
}

/** Extract the text of a `## <headingRegex>` subsection up to the next heading. */
function section(text: string, headingRegex: RegExp): string {
  const lines = text.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i])) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return "";
  const buf: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^#{1,3}\s/.test(lines[i])) break; // next heading ends the section
    buf.push(lines[i]);
  }
  return buf.join("\n");
}

function parseAll(): SeedProject[] {
  const text = readFileSync(PLAN_PATH, "utf8");
  const dsa = parseDsa(section(text, /^##\s+Track B\s+—\s+DSA \/ Python projects/i));
  const ml = parseMl(section(text, /^##\s+Track B\s+—\s+Classical ML projects/i));
  const rl = parseRl(section(text, /^##\s+Track B\s+—\s+RL projects/i));
  const llm = parseLlm(section(text, /^##\s+Track B\s+—\s+LLM Systems projects/i));
  return [...dsa, ...ml, ...rl, ...llm];
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const debug = process.argv.includes("--debug");

  const projects = parseAll();

  // Summary by category.
  const byCat = new Map<string, number>();
  for (const p of projects) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);

  console.log("=== PARSE SUMMARY ===");
  console.log("total projects:", projects.length);
  for (const [cat, n] of byCat) console.log(`  ${n.toString().padStart(3)}  ${cat}`);

  if (debug) {
    console.log("\n=== ALL PROJECTS ===");
    for (const p of projects) {
      const meta = [
        p.stageRef,
        p.weekWhen,
        p.priority,
        p.difficulty,
        p.estHours ? `~${p.estHours}h` : null,
        p.dependency ? `dep: ${p.dependency}` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      console.log(`[${p.category}] ${p.title}${meta ? `  (${meta})` : ""}`);
    }
  }

  if (dryRun) {
    console.log("\n[dry-run] no writes performed.");
    await prisma.$disconnect();
    return;
  }

  const workspace = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (!workspace) throw new Error("No workspace found. Sign in once to bootstrap it.");

  // Upsert each project by sourceKey (preserves favorite on re-run).
  let order = 0;
  for (const p of projects) {
    await prisma.project.upsert({
      where: { sourceKey: p.sourceKey },
      create: { ...p, sortOrder: order++, workspaceId: workspace.id },
      update: {
        title: p.title,
        description: p.description,
        category: p.category,
        stageRef: p.stageRef,
        weekWhen: p.weekWhen,
        priority: p.priority,
        difficulty: p.difficulty,
        estHours: p.estHours,
        dependency: p.dependency,
        sortOrder: order++,
      },
    });
  }

  // Delete stale rows (present before, no longer in the plan).
  const keys = new Set(projects.map((p) => p.sourceKey));
  const stale = await prisma.project.findMany({
    where: { workspaceId: workspace.id, sourceKey: { notIn: [...keys] } },
    select: { id: true },
  });
  let deleted = 0;
  if (stale.length > 0) {
    const res = await prisma.project.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
    deleted = res.count;
  }

  console.log("\n=== IMPORT COMPLETE ===");
  console.log(`projects upserted: ${projects.length}`);
  console.log(`stale removed: ${deleted}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});


