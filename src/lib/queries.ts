import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";
import {
  addDays,
  computeStreak,
  dateKey,
  endOfDay,
  startOfDay,
  startOfWeek,
} from "@/lib/dates";
import type { Prisma, Role, TaskStatus, Priority } from "@prisma/client";

export type WorkspaceMember = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
};

export async function getDashboardData() {
  const member = await requireMember();
  if (!member.ok) return null;
  const { id: userId, workspaceId } = member.user;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);

  const [todaysCheckIns, allCheckInDates, weekRows, weekToDateRows, dueTasks, goals, completedTasks] =
    await Promise.all([
      prisma.checkIn.findMany({
        where: { userId, date: { gte: today, lt: addDays(today, 1) } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.checkIn.findMany({ where: { userId }, select: { date: true } }),
      prisma.checkIn.groupBy({
        by: ["date"],
        where: { userId, date: { gte: addDays(today, -6), lt: addDays(today, 1) } },
        _sum: { durationMin: true },
      }),
      prisma.checkIn.groupBy({
        by: ["date"],
        where: { userId, date: { gte: weekStart, lt: addDays(today, 1) } },
        _sum: { durationMin: true },
      }),
      prisma.task.findMany({
        where: {
          workspaceId,
          status: { not: "done" },
          dueDate: { lte: addDays(today, 1) },
          OR: [{ assigneeId: userId }, { authorId: userId }],
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        include: {
          assignee: { select: { id: true, name: true } },
          author: { select: { id: true, name: true } },
        },
        take: 8,
      }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.task.findMany({
        where: { workspaceId, completedAt: { gte: addDays(today, -13) } },
        select: { completedAt: true },
      }),
    ]);

  const todayMinutes = todaysCheckIns.reduce((s, c) => s + c.durationMin, 0);
  const streak = computeStreak(allCheckInDates.map((c) => c.date));

  const last7 = new Map(weekRows.map((r) => [dateKey(r.date), r._sum.durationMin ?? 0]));
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = dateKey(d);
    week.push({
      date: key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      minutes: last7.get(key) ?? 0,
    });
  }

  const weekMinutes = weekToDateRows.reduce((s, r) => s + (r._sum.durationMin ?? 0), 0);
  const goalsWithProgress = goals.map((g) => {
    const actual = g.frequency === "daily" ? todayMinutes : weekMinutes;
    return {
      ...g,
      actualMin: actual,
      pct: g.targetMin > 0 ? Math.min(100, Math.round((actual / g.targetMin) * 100)) : 0,
    };
  });

  const completedByDay = new Map<string, number>();
  for (const task of completedTasks) {
    if (!task.completedAt) continue;
    const key = dateKey(task.completedAt);
    completedByDay.set(key, (completedByDay.get(key) ?? 0) + 1);
  }
  const taskTrend = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = dateKey(d);
    taskTrend.push({
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: completedByDay.get(key) ?? 0,
    });
  }

  return {
    todayMinutes,
    checkedInToday: todaysCheckIns.length > 0,
    streak,
    week,
    taskTrend,
    dueTasks,
    goals: goalsWithProgress,
  };
}

export type TaskFilters = {
  due?: "all" | "today" | "week" | "overdue";
  status?: TaskStatus | "all";
  priority?: Priority | "all";
  assignee?: "all" | "me";
};

export async function getTasks(filters: TaskFilters = {}) {
  const member = await requireMember();
  if (!member.ok) return null;

  const where: Prisma.TaskWhereInput = { workspaceId: member.user.workspaceId };
  const today = startOfDay(new Date());

  if (filters.due === "today") {
    where.dueDate = { lte: endOfDay(today) };
  } else if (filters.due === "week") {
    where.dueDate = { lte: endOfDay(addDays(today, 7)) };
  } else if (filters.due === "overdue") {
    where.dueDate = { lt: today };
    where.status = { not: "done" };
  }
  if (filters.status && filters.status !== "all") where.status = filters.status;
  if (filters.priority && filters.priority !== "all") where.priority = filters.priority;
  if (filters.assignee === "me") where.assigneeId = member.user.id;

  return prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignee: { select: { id: true, name: true } },
      author: { select: { id: true, name: true } },
      roadmapItem: {
        select: { id: true, title: true, roadmap: { select: { id: true, title: true } } },
      },
    },
  });
}

export async function getRoadmaps() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.roadmap.findMany({
    where: { workspaceId: member.user.workspaceId },
    include: {
      author: { select: { id: true, name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { assignee: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRoadmap(id: string) {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.roadmap.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    include: {
      author: { select: { id: true, name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { assignee: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function getWorkspaceMembers() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.user.findMany({
    where: { workspaceId: member.user.workspaceId },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export type TimelineItem = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  roadmap: { id: string; title: string; color: string | null };
  assignee: { id: string; name: string | null } | null;
};

export async function getTimeline() {
  const member = await requireMember();
  if (!member.ok) return null;

  const items = await prisma.roadmapItem.findMany({
    where: { roadmap: { workspaceId: member.user.workspaceId } },
    include: {
      roadmap: { select: { id: true, title: true, color: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: [{ startDate: "asc" }, { sortOrder: "asc" }],
  });

  return items as TimelineItem[];
}

export type CalendarEvent = {
  id: string;
  kind: "task" | "roadmap_item";
  title: string;
  date: Date;
  status: string;
  priority?: "low" | "medium" | "high";
  roadmapId?: string;
  roadmapTitle?: string;
};

export async function getCalendarEvents(month: Date) {
  const member = await requireMember();
  if (!member.ok) return null;

  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const [tasks, roadmapItems] = await Promise.all([
    prisma.task.findMany({
      where: {
        workspaceId: member.user.workspaceId,
        dueDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    }),
    prisma.roadmapItem.findMany({
      where: {
        roadmap: { workspaceId: member.user.workspaceId },
        endDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        title: true,
        status: true,
        endDate: true,
        roadmap: { select: { id: true, title: true } },
      },
    }),
  ]);

  const events: CalendarEvent[] = [
    ...tasks.map((t) => ({
      id: t.id,
      kind: "task" as const,
      title: t.title,
      date: t.dueDate as Date,
      status: t.status,
      priority: t.priority,
    })),
    ...roadmapItems.map((i) => ({
      id: i.id,
      kind: "roadmap_item" as const,
      title: i.title,
      date: i.endDate as Date,
      status: i.status,
      roadmapId: i.roadmap.id,
      roadmapTitle: i.roadmap.title,
    })),
  ];

  return events;
}

export async function getCheckInStats() {
  const member = await requireMember();
  if (!member.ok) return null;
  const userId = member.user.id;

  const today = startOfDay(new Date());
  const since = addDays(today, -180);

  const [checkIns, todayCheckIns] = await Promise.all([
    prisma.checkIn.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.checkIn.findMany({
      where: { userId, date: { gte: today, lt: addDays(today, 1) } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const heatmap: Record<string, number> = {};
  for (const c of checkIns) {
    const key = dateKey(c.date);
    heatmap[key] = (heatmap[key] ?? 0) + c.durationMin;
  }

  return {
    checkIns,
    todayCheckIns,
    streak: computeStreak(checkIns.map((c) => c.date)),
    todayMinutes: todayCheckIns.reduce((s, c) => s + c.durationMin, 0),
    totalMinutes: checkIns.reduce((s, c) => s + c.durationMin, 0),
    heatmap,
  };
}
