import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import {
  DEFAULT_MODEL_ID,
  isModelId,
  normalizeModelId,
  resolveModel,
} from "@/lib/ai-models";
import { normalizeUrl } from "@/lib/resource-links";

export const maxDuration = 30;

function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  // Bare "10 October" / "Oct 10" style with no year: anchor to the current year.
  // (Plain `new Date("10 October")` resolves to year 2001 per spec — never pass that through.)
  const noYear = /^[A-Za-z]{3,9}\s+\d{1,2}$|^\d{1,2}\s+[A-Za-z]{3,9}$/;
  const candidates = noYear.test(trimmed)
    ? [`${trimmed} ${new Date().getFullYear()}`, trimmed]
    : [trimmed];
  for (const candidate of candidates) {
    const direct = new Date(candidate);
    if (!isNaN(direct.getTime())) {
      // Guard against the classic JS fallback: 2-part dates landing in 2001.
      if (noYear.test(trimmed) && direct.getFullYear() < 2024) {
        const fixed = new Date(`${trimmed} ${new Date().getFullYear()}`);
        if (!isNaN(fixed.getTime())) return fixed;
        continue;
      }
      // Sanity window: study plans live in the present, not 2001 or 2040.
      if (direct.getFullYear() < 2024 || direct.getFullYear() > 2030) {
        continue;
      }
      return direct;
    }
  }
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    if (d.getFullYear() >= 2024 && d.getFullYear() <= 2030) return d;
  }
  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.workspaceId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const workspaceId = session.user.workspaceId;

  let body: { messages?: unknown[]; model?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];

  const [roadmaps, openTasks, recentCheckIns, goals, members] =
    await Promise.all([
      prisma.roadmap.findMany({
        where: { workspaceId },
        select: {
          title: true,
          items: {
            select: { title: true, status: true, endDate: true },
            orderBy: { sortOrder: "asc" },
            take: 8,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { workspaceId, status: { not: "done" } },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        take: 12,
      }),
      prisma.checkIn.findMany({
        where: { userId },
        select: { subject: true, durationMin: true, date: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.goal.findMany({ where: { userId }, take: 5 }),
      prisma.user.findMany({
        where: { workspaceId },
        select: { id: true, name: true, email: true },
      }),
    ]);

  const context = [
    "Workspace roadmaps:",
    roadmaps.length
      ? roadmaps
          .map(
            (r) =>
              `- ${r.title}: ${r.items
                .map((i) => `${i.title} (${i.status})`)
                .join(", ")}`,
          )
          .join("\n")
      : "(none)",
    "",
    "Open tasks:",
    openTasks.length
      ? openTasks
          .map(
            (t) =>
              `- [${t.id}] ${t.title} (${t.status}, ${t.priority}${
                t.dueDate ? `, due ${formatDate(t.dueDate)}` : ""
              })`,
          )
          .join("\n")
      : "(none)",
    "",
    "User's recent study sessions:",
    recentCheckIns.length
      ? recentCheckIns
          .map(
            (c) =>
              `- ${c.subject}: ${c.durationMin} min on ${c.date.toISOString().slice(0, 10)}`,
          )
          .join("\n")
      : "(none)",
    "",
    "User's goals:",
    goals.length
      ? goals
        .map(
          (g) =>
            `- ${g.frequency} target of ${g.targetMin} min${
              g.subject ? ` for ${g.subject}` : ""
            }`,
        )
        .join("\n")
      : "(none)",
    "",
    "Workspace members:",
    members.map((m) => `- ${m.name ?? m.email} (id ${m.id})`).join("\n"),
  ].join("\n");

  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD in server TZ
  const todayLong = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const systemPrompt = `You are the AI study assistant for a small study group. You can read AND modify the user's workspace data: tasks, roadmaps, check-ins, goals, practice questions, and quizzes.

TODAY IS ${todayLong} (${todayStr}).
- When the user gives a date without a year ("10 October", "Oct 10", "10 Oct"), it means ${today.getFullYear()} unless they explicitly say another year.
- NEVER invent 2025 or any past year. All deadlines are this year or later.
- "today" = ${todayStr}. "tomorrow" = the next calendar day. Weekday names ("Friday", "next Monday") resolve forward from today, never backward.
- When you call a tool with a date, ALWAYS pass a full YYYY-MM-DD string, never "10 October".

How to behave:
- When the user asks to add, change, or remove something, call the right tool. Do not just describe what they should do manually.
- After a tool call, confirm what you did in one or two plain sentences, including the resolved date (e.g. "due 10 October 2026").
- NEVER paste raw tool JSON (ids, {"id": ...}, {}) into your reply. Tool results render as their own cards — your reply must be plain human sentences only.
- If a request is ambiguous (unclear date, unknown task, missing subject), ask one clarifying question instead of guessing.

Study-time vs study-task disambiguation (IMPORTANT):
- "Add a 2-hour maths study task" / "add X hrs <subject> study task" = a TASK (a plan, createTask), NOT logged time. Durations belong in the task title (e.g. "Study mathematics (2 hrs)"), never in createCheckIn.
- Only call createCheckIn when the user says they ALREADY studied ("I studied maths 2 hours", "log 45 min biology").
- Never silently convert one into the other. If truly unclear, ask: "Should I add this as a task, or log it as time you already studied?"

Domain rules:
- Tasks are to-dos with an optional deadline (dueDate), priority, assignee, and resource links (title + URL study materials).
- Check-ins log COMPLETED study time (subject + minutes). Only log time the user says they actually studied, never planned time.
- Goals are daily or weekly minute targets, optionally for one subject.
- Roadmaps are long-term plans. Items have a title, status, progress (0-100), optional start/end dates, and resource links.
- RESOURCE LINKS: attach study materials with addTaskLinks / addRoadmapItemLinks (any member may add; at most 10 per task/item; URLs must be valid http(s) — normalize bare domains to https://). listTasks and listRoadmaps already show existing links with their ids — reuse them, never re-add duplicates. Remove with removeTaskLink / removeRoadmapItemLink.
- Practice questions are a bank of questions with topic, difficulty, prompt, options, and solution.
- Quizzes are graded assessments users take on the Quizzes page.
- The Timeline page is a READ-ONLY view of roadmap items (start/end dates). There is no separate "timeline" object: to change what the timeline shows, update the roadmap item dates; to clear the timeline, delete the roadmaps.
- TRUTHFULNESS: only ever claim an action is done when its tool returned success. For deletes, state the exact count the tool reported (e.g. "Deleted 2 roadmaps"). Never say "removed all" unless the tool reported every item gone.
- BULK DELETE SAFETY: "delete ALL roadmaps" requires the deleteAllRoadmaps tool with confirm DELETE. First reply asking for confirmation ("This will permanently delete N roadmaps... reply DELETE to confirm"), and only call the tool once the user confirms.
- FULL POWER: you can manage EVERYTHING — tasks, roadmaps + items, resource links on both, check-ins, goals, practice questions, quizzes (create/delete/grade), flashcards (create/delete/grade with SM-2), marathons (create/delete), notifications, and member lookup. Prefer doing the thing over describing it.
- QUIZ GRADING: to grade a quiz you need question ids — listQuizzes does NOT return questions. Either quiz the user interactively in chat (ask each question, collect answers, call gradeQuiz), or tell them to take it on the Quizzes page.
- FLASHCARD GRADING: gradeFlashcard reschedules with SM-2; tell the user the next due interval.
- MARATHON SESSIONS (join/log/finish) happen on the Marathons page timers — you create and delete marathons; you don't run live sessions.
- ADMIN ACTIONS (roles, removing users, providers) live on the /admin page — you can look up members with listMembers, but role changes stay with human admins.
- PROJECTS + RESOURCES LIBRARY: the /projects page lists every build in the roadmap (DSA/Python, Classical ML, RL, LLM Systems) and the /resources page is a library of 298 study materials. Use listProjects to answer "what projects do I have / what should I build next", favoriteProject to star one, and createTaskFromProject to add a project to the user's tasks. These are read/favorite/task actions — you don't edit project metadata itself.

Current workspace context:
${context}`;

  const requested = isModelId(body.model)
    ? normalizeModelId(body.model)
    : DEFAULT_MODEL_ID;
  const resolved = await resolveModel(requested);
  if (!resolved.ok) {
    return new Response(resolved.error, { status: 400 });
  }

  const result = streamText({
    model: resolved.model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages as never),
    stopWhen: stepCountIs(8),
    toolChoice: "auto",
    // Max reasoning everywhere: Google thinking HIGH + thoughts streamed,
    // any OpenAI-compatible endpoint reasoning effort HIGH.
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel: "high", includeThoughts: true } },
      openaiCompatible: { reasoningEffort: "high" },
    },
    tools: {
      getStudySummary: tool({
        description:
          "Get the user's study stats: today's minutes, streak, active goals, and tasks due soon. Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const [todaysCheckIns, allDates, dueTasks] = await Promise.all([
            prisma.checkIn.findMany({
              where: { userId, date: { gte: today, lt: tomorrow } },
            }),
            prisma.checkIn.findMany({
              where: { userId },
              select: { date: true },
            }),
            prisma.task.findMany({
              where: {
                workspaceId,
                status: { not: "done" },
                dueDate: { lte: tomorrow },
              },
              select: { title: true, dueDate: true },
              orderBy: { dueDate: "asc" },
              take: 5,
            }),
          ]);

          const todayMinutes = todaysCheckIns.reduce(
            (sum, c) => sum + c.durationMin,
            0,
          );
          const days = new Set(
            allDates.map((c) => c.date.toISOString().slice(0, 10)),
          );
          let streak = 0;
          for (let i = 0; ; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            if (days.has(d.toISOString().slice(0, 10))) streak++;
            else if (i === 0) continue;
            else break;
          }

          return JSON.stringify({
            todayMinutes,
            streak,
            checkInsToday: todaysCheckIns.length,
            dueSoon: dueTasks.map((t) => ({
              title: t.title,
              due: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
            })),
          });
        },
      }),

      listTasks: tool({
        description:
          "List tasks in the workspace, optionally filtered by status. Returns task ids, titles, status, priority, due dates, and resource links.",
        inputSchema: z.object({
          status: z
            .enum(["todo", "in_progress", "done"])
            .optional()
            .describe("Filter by status"),
        }),
        execute: async ({ status }) => {
          const tasks = await prisma.task.findMany({
            where: { workspaceId, ...(status ? { status } : {}) },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              resourceLinks: {
                select: { id: true, title: true, url: true },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
            take: 25,
          });
          if (tasks.length === 0)
            return JSON.stringify({ tasks: [], note: "No tasks found." });
          return JSON.stringify({
            tasks: tasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              priority: t.priority,
              due: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
              resourceLinks: t.resourceLinks,
            })),
          });
        },
      }),

      createTask: tool({
        description:
          "Create a new task. Use when the user asks to add something to do ('add a 2-hour maths study task'). Keep any duration in the title like 'Study mathematics (2 hrs)'. Never for completed study time.",
        inputSchema: z.object({
          title: z.string().min(1).describe("Short task title"),
          notes: z.string().optional().describe("Extra details"),
          priority: z
            .enum(["low", "medium", "high"])
            .optional()
            .describe("Priority, default medium. Use high only if the user says urgent/ASAP/exam."),
          dueDate: z
            .string()
            .optional()
            .describe("Deadline as FULL YYYY-MM-DD (e.g. 2026-10-10). Today or later, never a past year."),
          assigneeName: z
            .string()
            .optional()
            .describe("Workspace member name to assign"),
        }),
        execute: async (args) => {
          let assigneeId: string | null = null;
          if (args.assigneeName) {
            const member = members.find(
              (m) =>
                m.name?.toLowerCase() === args.assigneeName!.toLowerCase() ||
                m.email.toLowerCase() === args.assigneeName!.toLowerCase(),
            );
            if (!member) {
              return JSON.stringify({
                error: `No workspace member named "${args.assigneeName}".`,
              });
            }
            assigneeId = member.id;
          }

          let dueDate: Date | null = null;
          if (args.dueDate) {
            const parsed = parseDateInput(args.dueDate);
            if (!parsed) {
              return JSON.stringify({
                error: `Could not understand the date "${args.dueDate}". Use YYYY-MM-DD.`,
              });
            }
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (parsed < startOfToday) {
              return JSON.stringify({
                error: `That due date (${formatDate(parsed)}) is in the past. Give a date of today or later.`,
              });
            }
            dueDate = parsed;
          }

          const task = await prisma.task.create({
            data: {
              title: args.title,
              notes: args.notes ?? null,
              priority: args.priority ?? "medium",
              dueDate,
              assigneeId,
              authorId: userId,
              workspaceId,
            },
          });
          return JSON.stringify({
            created: true,
            id: task.id,
            title: task.title,
            due: dueDate ? formatDate(dueDate) : null,
          });
        },
      }),

      updateTask: tool({
        description:
          "Update an existing task's status, priority, due date, title, or notes. Get the task id from listTasks first.",
        inputSchema: z.object({
          id: z.string().describe("Task id"),
          title: z.string().optional(),
          status: z.enum(["todo", "in_progress", "done"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.string().optional().describe("New deadline as YYYY-MM-DD"),
          notes: z.string().optional(),
        }),
        execute: async (args) => {
          const existing = await prisma.task.findFirst({
            where: { id: args.id, workspaceId },
            select: { id: true, title: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({
              error: `Task ${args.id} not found in this workspace.`,
            });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({
              error: `You can only edit tasks you created (or ask an admin). "${existing.title}" was created by someone else.`,
            });
          }

          const data: Record<string, unknown> = {};
          if (args.title !== undefined) data.title = args.title;
          if (args.status !== undefined) {
            data.status = args.status;
            data.completedAt = args.status === "done" ? new Date() : null;
          }
          if (args.priority !== undefined) data.priority = args.priority;
          if (args.notes !== undefined) data.notes = args.notes;
          if (args.dueDate !== undefined) {
            const dueDate = parseDateInput(args.dueDate);
            if (!dueDate) {
              return JSON.stringify({
                error: `Could not understand the date "${args.dueDate}". Use YYYY-MM-DD.`,
              });
            }
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (dueDate < startOfToday) {
              return JSON.stringify({
                error: `That due date (${formatDate(dueDate)}) is in the past. Give a date of today or later.`,
              });
            }
            data.dueDate = dueDate;
          }

          await prisma.task.update({ where: { id: args.id }, data });
          return JSON.stringify({
            updated: true,
            id: args.id,
            title: existing.title,
          });
        },
      }),

      deleteTask: tool({
        description: "Delete a task by id. Get the id from listTasks first.",
        inputSchema: z.object({ id: z.string().describe("Task id") }),
        execute: async ({ id }) => {
          const existing = await prisma.task.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Task ${id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({
              error: `You can only delete tasks you created (or ask an admin). "${existing.title}" was created by someone else.`,
            });
          }
          await prisma.task.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.title });
        },
      }),

      addTaskLinks: tool({
        description:
          "Attach resource links (title + URL) to a task. Any member can do this. Get the task id from listTasks first.",
        inputSchema: z.object({
          id: z.string().describe("Task id"),
          links: z
            .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
            .min(1)
            .max(10)
            .describe("Links to attach"),
        }),
        execute: async ({ id, links }) => {
          const existing = await prisma.task.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Task ${id} not found.` });
          }
          const checked: { title: string; url: string }[] = [];
          for (const link of links) {
            const normalized = normalizeUrl(link.url);
            if (!normalized) {
              return JSON.stringify({
                error: `"${link.url.slice(0, 60)}" is not a valid http(s) URL.`,
              });
            }
            checked.push({ title: link.title.trim(), url: normalized });
          }
          const count = await prisma.resourceLink.count({ where: { taskId: id } });
          if (count + checked.length > 10) {
            return JSON.stringify({ error: "At most 10 resource links per task." });
          }
          await prisma.resourceLink.createMany({
            data: checked.map((l, i) => ({
              title: l.title,
              url: l.url,
              sortOrder: count + i,
              taskId: id,
            })),
          });
          return JSON.stringify({
            added: true,
            task: existing.title,
            count: checked.length,
          });
        },
      }),

      removeTaskLink: tool({
        description:
          "Remove one resource link from a task. Get the task id and link id from listTasks first.",
        inputSchema: z.object({
          id: z.string().describe("Task id"),
          linkId: z.string().describe("Resource link id"),
        }),
        execute: async ({ id, linkId }) => {
          const existing = await prisma.resourceLink.findFirst({
            where: { id: linkId, taskId: id, task: { workspaceId } },
            select: { id: true, title: true },
          });
          if (!existing) {
            return JSON.stringify({ error: "That link was not found on this task." });
          }
          await prisma.resourceLink.delete({ where: { id: linkId } });
          return JSON.stringify({ removed: true, title: existing.title });
        },
      }),

      addRoadmapItemLinks: tool({
        description:
          "Attach resource links (title + URL) to a roadmap item. Any member can do this. Get the item id from listRoadmaps first.",
        inputSchema: z.object({
          id: z.string().describe("Roadmap item id"),
          links: z
            .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
            .min(1)
            .max(10)
            .describe("Links to attach"),
        }),
        execute: async ({ id, links }) => {
          const existing = await prisma.roadmapItem.findFirst({
            where: { id, roadmap: { workspaceId } },
            select: { id: true, title: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Roadmap item ${id} not found.` });
          }
          const checked: { title: string; url: string }[] = [];
          for (const link of links) {
            const normalized = normalizeUrl(link.url);
            if (!normalized) {
              return JSON.stringify({
                error: `"${link.url.slice(0, 60)}" is not a valid http(s) URL.`,
              });
            }
            checked.push({ title: link.title.trim(), url: normalized });
          }
          const count = await prisma.resourceLink.count({
            where: { roadmapItemId: id },
          });
          if (count + checked.length > 10) {
            return JSON.stringify({ error: "At most 10 resource links per item." });
          }
          await prisma.resourceLink.createMany({
            data: checked.map((l, i) => ({
              title: l.title,
              url: l.url,
              sortOrder: count + i,
              roadmapItemId: id,
            })),
          });
          return JSON.stringify({
            added: true,
            item: existing.title,
            count: checked.length,
          });
        },
      }),

      removeRoadmapItemLink: tool({
        description:
          "Remove one resource link from a roadmap item. Get the item id and link id from listRoadmaps first.",
        inputSchema: z.object({
          id: z.string().describe("Roadmap item id"),
          linkId: z.string().describe("Resource link id"),
        }),
        execute: async ({ id, linkId }) => {
          const existing = await prisma.resourceLink.findFirst({
            where: { id: linkId, roadmapItemId: id, roadmapItem: { roadmap: { workspaceId } } },
            select: { id: true, title: true },
          });
          if (!existing) {
            return JSON.stringify({ error: "That link was not found on this item." });
          }
          await prisma.resourceLink.delete({ where: { id: linkId } });
          return JSON.stringify({ removed: true, title: existing.title });
        },
      }),

      deleteRoadmap: tool({
        description:
          "Delete ONE roadmap by id (its timeline items go with it). Get the id from listRoadmaps first. NEVER claim you deleted roadmaps until this tool returns deleted:true.",
        inputSchema: z.object({ id: z.string().describe("Roadmap id") }),
        execute: async ({ id }) => {
          const existing = await prisma.roadmap.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Roadmap ${id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({
              error: `You can only delete roadmaps you created (or ask an admin). "${existing.title}" was created by someone else.`,
            });
          }
          await prisma.roadmap.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.title });
        },
      }),

      deleteAllRoadmaps: tool({
        description:
          "Delete EVERY roadmap in the workspace (timeline items go with them). Use ONLY when the user explicitly asks to delete ALL roadmaps. There is no undo — confirm first in plain words.",
        inputSchema: z.object({
          confirm: z.string().describe("Echo the word DELETE to confirm bulk deletion."),
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async ({ confirm }) => {
          if (confirm !== "DELETE") {
            return JSON.stringify({
              error: "Bulk delete needs confirm:DELETE. Ask the user to confirm first.",
            });
          }
          const all = await prisma.roadmap.findMany({
            where: { workspaceId },
            select: { id: true, title: true, authorId: true },
          });
          const isAdmin = session.user.role === "admin" || session.user.role === "owner";
          const deletable = all.filter((r) => isAdmin || r.authorId === userId);
          if (deletable.length === 0) {
            return JSON.stringify({
              error: "No roadmaps you are allowed to delete were found.",
            });
          }
          await prisma.roadmap.deleteMany({
            where: { id: { in: deletable.map((r) => r.id) } },
          });
          return JSON.stringify({
            deleted: true,
            count: deletable.length,
            skipped: all.length - deletable.length,
          });
        },
      }),

      listRoadmaps: tool({
        description:
          "List roadmaps with their items (title, status, progress, dates, resource links). Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const roadmaps = await prisma.roadmap.findMany({
            where: { workspaceId },
            select: {
              id: true,
              title: true,
              description: true,
              startDate: true,
              endDate: true,
              items: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  progress: true,
                  startDate: true,
                  endDate: true,
                  resourceLinks: {
                    select: { id: true, title: true, url: true },
                    orderBy: { sortOrder: "asc" },
                  },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          });
          return JSON.stringify({ roadmaps });
        },
      }),

      createRoadmap: tool({
        description:
          "Create a new roadmap (a long-term study plan) with an optional date range.",
        inputSchema: z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          startDate: z.string().optional().describe("Start as FULL YYYY-MM-DD. Today or later, never a past year."),
          endDate: z.string().optional().describe("End as FULL YYYY-MM-DD. Must be on/after the start date."),
        }),
        execute: async (args) => {
          const startDate = args.startDate
            ? parseDateInput(args.startDate)
            : null;
          const endDate = args.endDate ? parseDateInput(args.endDate) : null;
          if (args.startDate && !startDate) {
            return JSON.stringify({
              error: `Could not understand start date "${args.startDate}". Use YYYY-MM-DD.`,
            });
          }
          if (args.endDate && !endDate) {
            return JSON.stringify({
              error: `Could not understand end date "${args.endDate}". Use YYYY-MM-DD.`,
            });
          }
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (startDate && startDate < startOfToday) {
            return JSON.stringify({
              error: `That start date (${formatDate(startDate)}) is in the past. Give a date of today or later.`,
            });
          }
          if (startDate && endDate && endDate < startDate) {
            return JSON.stringify({
              error: `The end date (${formatDate(endDate)}) is before the start date (${formatDate(startDate)}). Fix the range.`,
            });
          }
          const roadmap = await prisma.roadmap.create({
            data: {
              title: args.title,
              description: args.description ?? null,
              startDate,
              endDate,
              authorId: userId,
              workspaceId,
            },
          });
          return JSON.stringify({
            created: true,
            id: roadmap.id,
            title: roadmap.title,
          });
        },
      }),

      updateRoadmap: tool({
        description:
          "Update a roadmap's title, description, or date range. Get the id from listRoadmaps first.",
        inputSchema: z.object({
          id: z.string().describe("Roadmap id"),
          title: z.string().optional(),
          description: z.string().optional(),
          startDate: z.string().optional().describe("Start as FULL YYYY-MM-DD. Today or later."),
          endDate: z.string().optional().describe("End as FULL YYYY-MM-DD. Must be on/after the start date."),
        }),
        execute: async (args) => {
          const existing = await prisma.roadmap.findFirst({
            where: { id: args.id, workspaceId },
            select: { id: true, title: true, authorId: true, startDate: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Roadmap ${args.id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({
              error: `You can only edit roadmaps you created (or ask an admin). "${existing.title}" was created by someone else.`,
            });
          }
          const data: Record<string, unknown> = {};
          if (args.title !== undefined) data.title = args.title;
          if (args.description !== undefined)
            data.description = args.description;
          if (args.startDate !== undefined) {
            const startDate = parseDateInput(args.startDate);
            if (!startDate) {
              return JSON.stringify({
                error: `Could not understand start date "${args.startDate}".`,
              });
            }
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (startDate < startOfToday) {
              return JSON.stringify({
                error: `That start date (${formatDate(startDate)}) is in the past. Give a date of today or later.`,
              });
            }
            data.startDate = startDate;
          }
          if (args.endDate !== undefined) {
            const endDate = parseDateInput(args.endDate);
            if (!endDate) {
              return JSON.stringify({
                error: `Could not understand end date "${args.endDate}".`,
              });
            }
            const rangeStart = (data.startDate as Date | undefined) ?? existing.startDate;
            if (rangeStart && endDate < rangeStart) {
              return JSON.stringify({
                error: `The end date (${formatDate(endDate)}) is before the start date (${formatDate(rangeStart)}). Fix the range.`,
              });
            }
            data.endDate = endDate;
          }
          await prisma.roadmap.update({ where: { id: args.id }, data });
          return JSON.stringify({ updated: true, title: existing.title });
        },
      }),

      createRoadmapItem: tool({
        description:
          "Add an item to a roadmap with optional dates, assignee, and progress.",
        inputSchema: z.object({
          roadmapId: z.string().describe("Roadmap id"),
          title: z.string().min(1),
          description: z.string().optional(),
          startDate: z.string().optional().describe("Start as FULL YYYY-MM-DD. Today or later."),
          endDate: z.string().optional().describe("End as FULL YYYY-MM-DD. Must be on/after the start date."),
          assigneeName: z.string().optional(),
          progress: z.number().int().min(0).max(100).optional(),
        }),
        execute: async (args) => {
          const roadmap = await prisma.roadmap.findFirst({
            where: { id: args.roadmapId, workspaceId },
            select: { id: true, title: true },
          });
          if (!roadmap) {
            return JSON.stringify({
              error: `Roadmap ${args.roadmapId} not found.`,
            });
          }
          let assigneeId: string | null = null;
          if (args.assigneeName) {
            const member = members.find(
              (m) =>
                m.name?.toLowerCase() ===
                args.assigneeName!.toLowerCase(),
            );
            if (!member) {
              return JSON.stringify({
                error: `No workspace member named "${args.assigneeName}".`,
              });
            }
            assigneeId = member.id;
          }
          const startDate = args.startDate
            ? parseDateInput(args.startDate)
            : null;
          const endDate = args.endDate ? parseDateInput(args.endDate) : null;
          if (args.startDate && !startDate) {
            return JSON.stringify({
              error: `Could not understand start date "${args.startDate}". Use YYYY-MM-DD.`,
            });
          }
          if (args.endDate && !endDate) {
            return JSON.stringify({
              error: `Could not understand end date "${args.endDate}". Use YYYY-MM-DD.`,
            });
          }
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          if (startDate && startDate < startOfToday) {
            return JSON.stringify({
              error: `That start date (${formatDate(startDate)}) is in the past. Give a date of today or later.`,
            });
          }
          if (startDate && endDate && endDate < startDate) {
            return JSON.stringify({
              error: `The end date (${formatDate(endDate)}) is before the start date (${formatDate(startDate)}). Fix the range.`,
            });
          }
          const item = await prisma.roadmapItem.create({
            data: {
              roadmapId: roadmap.id,
              title: args.title,
              description: args.description ?? null,
              startDate,
              endDate,
              assigneeId,
              progress: args.progress ?? 0,
              authorId: userId,
            },
          });
          return JSON.stringify({
            created: true,
            id: item.id,
            roadmap: roadmap.title,
            title: item.title,
          });
        },
      }),

      deleteRoadmapItem: tool({
        description:
          "Delete ONE roadmap item (a timeline bar) by id. Get the item id from listRoadmaps first. The timeline is a view of roadmap items — deleting the item removes its bar.",
        inputSchema: z.object({ id: z.string().describe("Roadmap item id") }),
        execute: async ({ id }) => {
          const existing = await prisma.roadmapItem.findFirst({
            where: { id, roadmap: { workspaceId } },
            select: { id: true, title: true, roadmap: { select: { authorId: true } } },
          });
          if (!existing) {
            return JSON.stringify({ error: `Roadmap item ${id} not found.` });
          }
          if (
            existing.roadmap.authorId !== userId &&
            session.user.role !== "admin" &&
            session.user.role !== "owner"
          ) {
            return JSON.stringify({
              error: `You can only delete items in roadmaps you created (or ask an admin).`,
            });
          }
          await prisma.roadmapItem.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.title });
        },
      }),

      updateRoadmapItem: tool({
        description:
          "Update a roadmap item's status, progress, dates, or assignee. Get the item id from listRoadmaps first.",
        inputSchema: z.object({
          id: z.string().describe("Roadmap item id"),
          title: z.string().optional(),
          status: z
            .enum(["todo", "in_progress", "done"])
            .optional(),
          progress: z.number().int().min(0).max(100).optional(),
          startDate: z.string().optional().describe("YYYY-MM-DD"),
          endDate: z.string().optional().describe("YYYY-MM-DD"),
          assigneeName: z.string().optional(),
        }),
        execute: async (args) => {
          const existing = await prisma.roadmapItem.findFirst({
            where: { id: args.id, roadmap: { workspaceId } },
            select: { id: true, title: true, authorId: true, startDate: true },
          });
          if (!existing) {
            return JSON.stringify({
              error: `Roadmap item ${args.id} not found.`,
            });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({
              error: `You can only edit roadmap items you created (or ask an admin). "${existing.title}" was created by someone else.`,
            });
          }
          const data: Record<string, unknown> = {};
          if (args.title !== undefined) data.title = args.title;
          if (args.status !== undefined) data.status = args.status;
          if (args.progress !== undefined) data.progress = args.progress;
          if (args.startDate !== undefined) {
            const startDate = parseDateInput(args.startDate);
            if (!startDate) {
              return JSON.stringify({
                error: `Could not understand start date "${args.startDate}".`,
              });
            }
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            if (startDate < startOfToday) {
              return JSON.stringify({
                error: `That start date (${formatDate(startDate)}) is in the past. Give a date of today or later.`,
              });
            }
            data.startDate = startDate;
          }
          if (args.endDate !== undefined) {
            const endDate = parseDateInput(args.endDate);
            if (!endDate) {
              return JSON.stringify({
                error: `Could not understand end date "${args.endDate}".`,
              });
            }
            const rangeStart = (data.startDate as Date | undefined) ?? existing.startDate;
            if (rangeStart && endDate < rangeStart) {
              return JSON.stringify({
                error: `The end date (${formatDate(endDate)}) is before the start date (${formatDate(rangeStart)}). Fix the range.`,
              });
            }
            data.endDate = endDate;
          }
          if (args.assigneeName !== undefined) {
            const member = members.find(
              (m) =>
                m.name?.toLowerCase() === args.assigneeName!.toLowerCase(),
            );
            data.assigneeId = member ? member.id : null;
          }
          await prisma.roadmapItem.update({ where: { id: args.id }, data });
          return JSON.stringify({ updated: true, title: existing.title });
        },
      }),

      listCheckIns: tool({
        description: "List the user's recent study check-ins (subject, minutes, date).",
        inputSchema: z.object({
          limit: z.number().int().min(1).max(30).optional(),
        }),
        execute: async ({ limit }) => {
          const checkIns = await prisma.checkIn.findMany({
            where: { userId },
            select: { subject: true, durationMin: true, date: true, note: true },
            orderBy: { date: "desc" },
            take: limit ?? 10,
          });
          return JSON.stringify({
            checkIns: checkIns.map((c) => ({
              subject: c.subject,
              durationMin: c.durationMin,
              date: c.date.toISOString().slice(0, 10),
              note: c.note,
            })),
          });
        },
      }),

      createCheckIn: tool({
        description:
          "Log a COMPLETED study session (subject + minutes). Only use when the user says they actually studied ('I studied maths 2 hours', 'log 45 min biology'). Never for planned/future study.",
        inputSchema: z.object({
          subject: z.string().min(1).describe("Subject studied"),
          durationMin: z
            .number()
            .int()
            .min(1)
            .max(1440)
            .describe("Minutes already studied"),
          note: z.string().optional(),
          date: z
            .string()
            .optional()
            .describe("Date as FULL YYYY-MM-DD, defaults to today. Never a future date."),
        }),
        execute: async (args) => {
          let date = new Date();
          if (args.date) {
            const parsed = parseDateInput(args.date);
            if (!parsed) {
              return JSON.stringify({
                error: `Could not understand the date "${args.date}". Use YYYY-MM-DD.`,
              });
            }
            const startOfTomorrow = new Date();
            startOfTomorrow.setHours(0, 0, 0, 0);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
            if (parsed >= startOfTomorrow) {
              return JSON.stringify({
                error: `Check-ins log time you ALREADY studied. ${formatDate(parsed)} is in the future — use createTask for planned study instead.`,
              });
            }
            date = parsed;
          }
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

          const checkIn = await prisma.checkIn.upsert({
            where: {
              userId_date_subject: {
                userId,
                date,
                subject: args.subject,
              },
            },
            update: {
              durationMin: { increment: args.durationMin },
              note: args.note ?? undefined,
            },
            create: {
              userId,
              date,
              subject: args.subject,
              durationMin: args.durationMin,
              note: args.note ?? null,
            },
          });
          return JSON.stringify({
            logged: true,
            subject: checkIn.subject,
            durationMin: checkIn.durationMin,
            date: checkIn.date.toISOString().slice(0, 10),
          });
        },
      }),

      deleteCheckIn: tool({
        description: "Delete a logged study session by id (fixes a wrongly logged session). Get the id from listCheckIns first. Only the user's own sessions.",
        inputSchema: z.object({ id: z.string().describe("Check-in id") }),
        execute: async ({ id }) => {
          const existing = await prisma.checkIn.findFirst({
            where: { id, userId },
            select: { id: true, subject: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Check-in ${id} not found.` });
          }
          await prisma.checkIn.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.subject });
        },
      }),

      listGoals: tool({
        description: "List the user's study goals (daily/weekly minute targets). Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
          });
          return JSON.stringify({ goals });
        },
      }),

      createGoal: tool({
        description:
          "Create a study goal: a daily or weekly minute target, optionally for one subject.",
        inputSchema: z.object({
          frequency: z.enum(["daily", "weekly"]),
          targetMin: z.number().int().min(1).max(10000),
          subject: z.string().optional(),
        }),
        execute: async (args) => {
          const goal = await prisma.goal.create({
            data: {
              frequency: args.frequency,
              targetMin: args.targetMin,
              subject: args.subject ?? null,
              userId,
            },
          });
          return JSON.stringify({
            created: true,
            goal: `${goal.frequency} target of ${goal.targetMin} min${
              goal.subject ? ` for ${goal.subject}` : ""
            }`,
          });
        },
      }),

      updateGoal: tool({
        description: "Change a goal's frequency, target minutes, or subject. Get the id from listGoals first.",
        inputSchema: z.object({
          id: z.string().describe("Goal id"),
          frequency: z.enum(["daily", "weekly"]).optional(),
          targetMin: z.number().int().min(1).max(10000).optional(),
          subject: z.string().optional().describe("Subject focus (empty string clears it)"),
        }),
        execute: async (args) => {
          const existing = await prisma.goal.findFirst({
            where: { id: args.id, userId },
            select: { id: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Goal ${args.id} not found.` });
          }
          const data: { frequency?: "daily" | "weekly"; targetMin?: number; subject?: string | null } = {};
          if (args.frequency !== undefined) data.frequency = args.frequency;
          if (args.targetMin !== undefined) data.targetMin = args.targetMin;
          if (args.subject !== undefined) data.subject = args.subject.trim() || null;
          await prisma.goal.update({ where: { id: args.id }, data });
          return JSON.stringify({ updated: true, goal: "goal" });
        },
      }),

      deleteGoal: tool({
        description: "Delete a study goal by id. Get the id from listGoals first.",
        inputSchema: z.object({ id: z.string().describe("Goal id") }),
        execute: async ({ id }) => {
          const existing = await prisma.goal.findFirst({
            where: { id, userId },
            select: { id: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Goal ${id} not found.` });
          }
          await prisma.goal.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: "goal" });
        },
      }),

      listPracticeQuestions: tool({
        description:
          "List practice questions in the workspace bank, optionally filtered by topic or difficulty.",
        inputSchema: z.object({
          topic: z.string().optional(),
          difficulty: z
            .enum(["easy", "medium", "hard"])
            .optional(),
        }),
        execute: async ({ topic, difficulty }) => {
          const questions = await prisma.practiceQuestion.findMany({
            where: {
              workspaceId,
              ...(topic ? { topic: { contains: topic, mode: "insensitive" } } : {}),
              ...(difficulty ? { difficulty } : {}),
            },
            select: {
              id: true,
              topic: true,
              difficulty: true,
              prompt: true,
              solution: true,
              mastered: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          });
          return JSON.stringify({ questions });
        },
      }),

      createPracticeQuestion: tool({
        description:
          "Add a practice question to the workspace bank.",
        inputSchema: z.object({
          topic: z.string().min(1),
          prompt: z.string().min(1),
          difficulty: z
            .enum(["easy", "medium", "hard"])
            .optional(),
          solution: z.string().optional(),
        }),
        execute: async (args) => {
          const question = await prisma.practiceQuestion.create({
            data: {
              topic: args.topic,
              prompt: args.prompt,
              difficulty: args.difficulty ?? "medium",
              solution: args.solution ?? null,
              authorId: userId,
              workspaceId,
            },
          });
          return JSON.stringify({
            created: true,
            id: question.id,
            topic: question.topic,
          });
        },
      }),

      updatePracticeQuestion: tool({
        description: "Edit a practice question's topic, difficulty, prompt, options, or solution. Get the id from listPracticeQuestions first. Author or admin only.",
        inputSchema: z.object({
          id: z.string().describe("Question id"),
          topic: z.string().optional(),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
          prompt: z.string().optional(),
          options: z.array(z.string()).optional().describe("Answer options (empty clears)"),
          solution: z.string().optional().describe("Solution text (empty clears)"),
        }),
        execute: async (args) => {
          const existing = await prisma.practiceQuestion.findFirst({
            where: { id: args.id, workspaceId },
            select: { id: true, topic: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Question ${args.id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({ error: "You can only edit questions you created (or ask an admin)." });
          }
          const data: Record<string, unknown> = {};
          if (args.topic !== undefined) data.topic = args.topic.trim();
          if (args.difficulty !== undefined) data.difficulty = args.difficulty;
          if (args.prompt !== undefined) data.prompt = args.prompt.trim();
          if (args.options !== undefined) data.options = args.options.length > 0 ? args.options : null;
          if (args.solution !== undefined) data.solution = args.solution.trim() || null;
          await prisma.practiceQuestion.update({ where: { id: args.id }, data: data as never });
          return JSON.stringify({ updated: true, topic: existing.topic });
        },
      }),

      deletePracticeQuestion: tool({
        description: "Delete a practice question by id. Get the id from listPracticeQuestions first. Author or admin only.",
        inputSchema: z.object({ id: z.string().describe("Question id") }),
        execute: async ({ id }) => {
          const existing = await prisma.practiceQuestion.findFirst({
            where: { id, workspaceId },
            select: { id: true, topic: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Question ${id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({ error: "You can only delete questions you created (or ask an admin)." });
          }
          await prisma.practiceQuestion.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.topic });
        },
      }),

      setPracticeQuestionMastered: tool({
        description: "Mark a practice question mastered (or unmastered). Get the id from listPracticeQuestions first.",
        inputSchema: z.object({
          id: z.string().describe("Question id"),
          mastered: z.boolean().describe("true = mastered, false = needs work"),
        }),
        execute: async ({ id, mastered }) => {
          const existing = await prisma.practiceQuestion.findFirst({
            where: { id, workspaceId },
            select: { id: true, topic: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Question ${id} not found.` });
          }
          await prisma.practiceQuestion.update({ where: { id }, data: { mastered } });
          return JSON.stringify({ updated: true, topic: existing.topic });
        },
      }),

      createQuiz: tool({
        description: "Create a full quiz with questions in one step (title + up to 10 questions). Each question: type mcq|true_false|short_answer, prompt, answer, options (4 for mcq), explanation. Call this when the user says 'make a quiz on X'.",
        inputSchema: z.object({
          title: z.string().min(1).max(200),
          topic: z.string().optional(),
          description: z.string().optional(),
          questions: z.array(z.object({
            type: z.enum(["mcq", "true_false", "short_answer"]),
            prompt: z.string().min(1),
            options: z.array(z.string()).optional().describe("4 options for mcq"),
            answer: z.string().min(1).describe("Exact option text for mcq; True/False for true_false"),
            explanation: z.string().optional(),
          })).min(1).max(10),
        }),
        execute: async (args) => {
          const questions = args.questions
            .map((q, i) => ({
              type: q.type,
              prompt: q.prompt.trim(),
              options: q.type === "mcq" && q.options && q.options.length > 0 ? q.options : undefined,
              answer: q.answer.trim(),
              explanation: q.explanation?.trim() || null,
              sortOrder: i,
            }))
            .filter((q) => q.prompt && q.answer);
          if (questions.length === 0) {
            return JSON.stringify({ error: "Every question needs a prompt and an answer." });
          }
          const quiz = await prisma.quiz.create({
            data: {
              title: args.title.trim(),
              description: args.description?.trim() || null,
              topic: args.topic?.trim() || null,
              source: "manual",
              authorId: userId,
              workspaceId,
              questions: { create: questions as never },
            },
            select: { id: true, title: true },
          });
          return JSON.stringify({ created: true, id: quiz.id, title: quiz.title, questions: questions.length });
        },
      }),

      deleteQuiz: tool({
        description: "Delete a quiz (and its attempts) by id. Get the id from listQuizzes first. Author or admin only.",
        inputSchema: z.object({ id: z.string().describe("Quiz id") }),
        execute: async ({ id }) => {
          const existing = await prisma.quiz.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true, authorId: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Quiz ${id} not found.` });
          }
          if (existing.authorId !== userId && session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({ error: "You can only delete quizzes you created (or ask an admin)." });
          }
          await prisma.quiz.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.title });
        },
      }),

      gradeQuiz: tool({
        description: "Grade a quiz attempt: give the quiz id plus the user's answers and get the score. Get the quiz id from listQuizzes first. IMPORTANT: fetch the questions via the quiz page data is not available — instead, ask the user each question in chat, collect answers, then grade here. Answers is an object of questionId->answer; use listQuizzes then ask. If you don't know question ids, say so and quiz interactively instead.",
        inputSchema: z.object({
          quizId: z.string().describe("Quiz id"),
          answers: z.record(z.string(), z.string()).describe("Map of questionId to given answer"),
        }),
        execute: async ({ quizId, answers }) => {
          const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, workspaceId },
            include: { questions: { orderBy: { sortOrder: "asc" } } },
          });
          if (!quiz) {
            return JSON.stringify({ error: `Quiz ${quizId} not found.` });
          }
          const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
          let score = 0;
          const results = quiz.questions.map((q) => {
            const given = (answers[q.id] ?? "").trim();
            const g = norm(given);
            const a = norm(q.answer);
            const correct = q.type === "short_answer" ? (g !== "" && (g === a || a.includes(g))) : g !== "" && g === a;
            if (correct) score++;
            return { prompt: q.prompt, given, correctAnswer: q.answer, explanation: q.explanation, correct };
          });
          const total = quiz.questions.length;
          const pct = total > 0 ? Math.round((score / total) * 100) : 0;
          await prisma.quizAttempt.create({
            data: { quizId: quiz.id, userId, score, total, answers: answers as never, completedAt: new Date() },
          });
          return JSON.stringify({ graded: true, title: quiz.title, score, total, pct, results });
        },
      }),

      listQuizzes: tool({
        description: "List quizzes in the workspace with question and attempt counts. Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const quizzes = await prisma.quiz.findMany({
            where: { workspaceId },
            select: {
              id: true,
              title: true,
              topic: true,
              source: true,
              _count: { select: { questions: true, attempts: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 15,
          });
          return JSON.stringify({ quizzes });
        },
      }),
      listMarathons: tool({
        description: "List study marathons in the workspace (title, type, start, duration). Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const marathons = await prisma.marathon.findMany({
            where: { workspaceId },
            select: { id: true, title: true, type: true, startsAt: true, durationMin: true, goalMin: true },
            orderBy: { createdAt: "desc" },
            take: 15,
          });
          return JSON.stringify({ marathons });
        },
      }),

      createMarathon: tool({
        description: "Create a study marathon (a timed group focus session). scheduled needs a start date (YYYY-MM-DD); ondemand starts whenever. Duration 1-1440 min.",
        inputSchema: z.object({
          title: z.string().min(1).max(120),
          type: z.enum(["scheduled", "ondemand"]),
          startsAt: z.string().optional().describe("Start as FULL YYYY-MM-DD (scheduled only)"),
          durationMin: z.number().int().min(1).max(1440),
          goalMin: z.number().int().min(1).max(1440).optional(),
        }),
        execute: async (args) => {
          let startsAt: Date | null = null;
          if (args.type === "scheduled") {
            if (!args.startsAt) return JSON.stringify({ error: "Scheduled marathons need a start date." });
            const parsed = parseDateInput(args.startsAt);
            if (!parsed) return JSON.stringify({ error: `Could not understand start date "${args.startsAt}".` });
            startsAt = parsed;
          }
          const marathon = await prisma.marathon.create({
            data: {
              title: args.title.trim(),
              type: args.type,
              startsAt,
              durationMin: args.durationMin,
              goalMin: args.goalMin ?? null,
              workspaceId,
            },
          });
          return JSON.stringify({ created: true, id: marathon.id, title: marathon.title });
        },
      }),

      deleteMarathon: tool({
        description: "Delete a marathon by id. Get the id from listMarathons first. Admin only (mirrors the Marathons page).",
        inputSchema: z.object({ id: z.string().describe("Marathon id") }),
        execute: async ({ id }) => {
          if (session.user.role !== "admin" && session.user.role !== "owner") {
            return JSON.stringify({ error: "Only admins can delete marathons." });
          }
          const existing = await prisma.marathon.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Marathon ${id} not found.` });
          }
          await prisma.marathon.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.title });
        },
      }),

      listFlashcards: tool({
        description: "List the user's flashcards (front, back, topic, due date). Optionally filter by topic. Flashcards are personal to the user.",
        inputSchema: z.object({
          topic: z.string().optional(),
        }),
        execute: async ({ topic }) => {
          const cards = await prisma.flashcard.findMany({
            where: { userId, ...(topic ? { topic: { contains: topic, mode: "insensitive" } } : {}) },
            select: { id: true, front: true, back: true, topic: true, dueDate: true, repetitions: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          });
          return JSON.stringify({ flashcards: cards });
        },
      }),

      createFlashcard: tool({
        description: "Create one flashcard (front = question/term, back = answer/definition), optionally tagged with a topic.",
        inputSchema: z.object({
          front: z.string().min(1),
          back: z.string().min(1),
          topic: z.string().optional(),
        }),
        execute: async (args) => {
          const card = await prisma.flashcard.create({
            data: {
              front: args.front.trim(),
              back: args.back.trim(),
              topic: args.topic?.trim() || null,
              userId,
            },
          });
          return JSON.stringify({ created: true, id: card.id, front: card.front });
        },
      }),

      deleteFlashcard: tool({
        description: "Delete a flashcard by id. Get the id from listFlashcards first. Only the user's own cards.",
        inputSchema: z.object({ id: z.string().describe("Flashcard id") }),
        execute: async ({ id }) => {
          const existing = await prisma.flashcard.findFirst({
            where: { id, userId },
            select: { id: true, front: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Flashcard ${id} not found.` });
          }
          await prisma.flashcard.delete({ where: { id } });
          return JSON.stringify({ deleted: true, title: existing.front });
        },
      }),

      gradeFlashcard: tool({
        description: "Grade a flashcard review (again/hard/good/easy) — reschedules it with SM-2 spaced repetition. Get the id from listFlashcards first.",
        inputSchema: z.object({
          id: z.string().describe("Flashcard id"),
          grade: z.enum(["again", "hard", "good", "easy"]),
        }),
        execute: async ({ id, grade }) => {
          const existing = await prisma.flashcard.findFirst({
            where: { id, userId },
            select: { id: true, front: true, easeFactor: true, intervalDays: true, repetitions: true },
          });
          if (!existing) {
            return JSON.stringify({ error: `Flashcard ${id} not found.` });
          }
          let easeFactor = existing.easeFactor;
          let intervalDays = existing.intervalDays;
          let repetitions = existing.repetitions;
          if (grade === "again") {
            repetitions = 0;
            intervalDays = 1;
          } else {
            repetitions += 1;
            if (repetitions === 1) intervalDays = 1;
            else if (repetitions === 2) intervalDays = 6;
            else intervalDays = Math.round(intervalDays * easeFactor);
            const adj = grade === "hard" ? -0.15 : grade === "easy" ? 0.15 : 0;
            easeFactor = Math.min(3.0, Math.max(1.3, easeFactor + adj));
          }
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + intervalDays);
          await prisma.flashcard.update({
            where: { id },
            data: { easeFactor, intervalDays, repetitions, dueDate, lastReviewedAt: new Date() },
          });
          return JSON.stringify({ graded: true, title: existing.front, nextDueInDays: intervalDays });
        },
      }),

      listNotifications: tool({
        description: "List the user's notifications (deadlines, marathons, quiz grades). Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const notifications = await prisma.notification.findMany({
            where: { userId },
            select: { id: true, type: true, title: true, body: true, readAt: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 15,
          });
          return JSON.stringify({ notifications });
        },
      }),

      markAllNotificationsRead: tool({
        description: "Mark all the user's notifications as read. Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const result = await prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
          });
          return JSON.stringify({ updated: true, count: result.count });
        },
      }),

      listMembers: tool({
        description: "List workspace members (name, email, role). Use to resolve who to assign things to. Takes no input.",
        inputSchema: z.object({
          _unused: z.string().optional().describe("Unused. Omit this field."),
        }),
        execute: async () => {
          const members = await prisma.user.findMany({
            where: { workspaceId },
            select: { id: true, name: true, email: true, role: true },
            orderBy: { name: "asc" },
          });
          return JSON.stringify({ members });
        },
      }),

      listProjects: tool({
        description:
          "List the roadmap projects (the builds on the /projects page), optionally filtered by category (DSA / Python, Classical ML, Reinforcement Learning, LLM Systems), search text, or favorites only. Returns project ids, titles, category, stage, est. hours, priority, and favorite state.",
        inputSchema: z.object({
          category: z
            .string()
            .optional()
            .describe("Filter by category, e.g. 'LLM Systems' or 'Classical ML'"),
          search: z.string().optional().describe("Filter by title/description text"),
          favoritesOnly: z.boolean().optional().describe("Only favorited projects"),
        }),
        execute: async ({ category, search, favoritesOnly }) => {
          const where: Record<string, unknown> = { workspaceId };
          if (category) where.category = category;
          if (favoritesOnly) where.favorite = true;
          if (search) {
            where.OR = [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ];
          }
          const projects = await prisma.project.findMany({
            where,
            select: {
              id: true,
              title: true,
              category: true,
              stageRef: true,
              estHours: true,
              priority: true,
              favorite: true,
            },
            orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
            take: 60,
          });
          if (projects.length === 0)
            return JSON.stringify({ projects: [], note: "No projects found." });
          return JSON.stringify({ count: projects.length, projects });
        },
      }),

      favoriteProject: tool({
        description:
          "Toggle a project's favorite (star). Get the project id from listProjects first.",
        inputSchema: z.object({
          id: z.string().describe("Project id"),
        }),
        execute: async ({ id }) => {
          const existing = await prisma.project.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true, favorite: true },
          });
          if (!existing) return JSON.stringify({ error: `Project ${id} not found.` });
          const updated = await prisma.project.update({
            where: { id },
            data: { favorite: !existing.favorite },
            select: { favorite: true },
          });
          return JSON.stringify({
            title: existing.title,
            favorite: updated.favorite,
          });
        },
      }),

      createTaskFromProject: tool({
        description:
          "Add a roadmap project to the user's Tasks (as 'Build: <project>') so it can be tracked. Optionally give a due date (YYYY-MM-DD). Skips if an open task for it already exists. Get the project id from listProjects first.",
        inputSchema: z.object({
          id: z.string().describe("Project id"),
          dueDate: z.string().optional().describe("YYYY-MM-DD"),
        }),
        execute: async ({ id, dueDate }) => {
          const project = await prisma.project.findFirst({
            where: { id, workspaceId },
            select: { id: true, title: true, description: true, category: true },
          });
          if (!project) return JSON.stringify({ error: `Project ${id} not found.` });
          const taskTitle = `Build: ${project.title}`;
          const existing = await prisma.task.findFirst({
            where: { workspaceId, title: taskTitle, status: { not: "done" } },
            select: { id: true },
          });
          if (existing) {
            return JSON.stringify({
              alreadyExisted: true,
              title: taskTitle,
              note: "Already on your tasks.",
            });
          }
          let due: Date | null = null;
          if (dueDate) {
            due = parseDateInput(dueDate);
            if (!due) {
              return JSON.stringify({ error: `Could not understand due date "${dueDate}".` });
            }
          }
          const notes = project.description
            ? `${project.description}\n\nCategory: ${project.category}`
            : `Category: ${project.category}`;
          const task = await prisma.task.create({
            data: {
              title: taskTitle,
              notes,
              priority: "medium",
              status: "todo",
              dueDate: due,
              authorId: userId,
              workspaceId,
            },
            select: { id: true, dueDate: true },
          });
          return JSON.stringify({
            created: true,
            title: taskTitle,
            due: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
          });
        },
      }),

    },
    onFinish: async ({ text }) => {
      try {
        const lastUserMessage = [...messages]
          .reverse()
          .find(
            (m) =>
              typeof m === "object" &&
              m !== null &&
              (m as { role?: string }).role === "user",
          ) as { parts?: { type?: string; text?: string }[] } | undefined;
        const userContent =
          lastUserMessage?.parts
            ?.filter((p) => p.type === "text" && typeof p.text === "string")
            .map((p) => p.text as string)
            .join("\n")
            .slice(0, 4000) ?? null;
        if (userContent) {
          await prisma.aIMessage.create({
            data: { userId, role: "user", content: userContent.slice(0, 4000) },
          });
        }
        if (text) {
          await prisma.aIMessage.create({
            data: { userId, role: "assistant", content: text.slice(0, 4000) },
          });
        }
      } catch {
        // persistence is best-effort; never fail the stream
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
