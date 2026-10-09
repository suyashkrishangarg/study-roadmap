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
import type {
  Marathon,
  MarathonSession,
  Prisma,
  PracticeQuestionDifficulty,
  Priority,
  ResourceLevel,
  ResourceType,
  Role,
  TaskStatus,
} from "@prisma/client";

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
      // Streak only needs recent days, not the full history.
      prisma.checkIn.findMany({
        where: { userId, date: { gte: addDays(today, -60) } },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 60,
      }),
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
          resourceLinks: { orderBy: { sortOrder: "asc" } },
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
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    include: {
      assignee: { select: { id: true, name: true } },
      author: { select: { id: true, name: true } },
      roadmapItem: {
        select: { id: true, title: true, roadmap: { select: { id: true, title: true } } },
      },
      resourceLinks: { orderBy: { sortOrder: "asc" } },
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
        include: {
          assignee: { select: { id: true, name: true } },
          resourceLinks: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
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
        include: {
          assignee: { select: { id: true, name: true } },
          resourceLinks: { orderBy: { sortOrder: "asc" } },
        },
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

export type PracticeQuestionFilters = {
  topic?: string;
  difficulty?: PracticeQuestionDifficulty | "all";
  mastered?: "all" | "mastered" | "unmastered";
};

export async function getPracticeQuestions(
  filters: PracticeQuestionFilters = {},
) {
  const member = await requireMember();
  if (!member.ok) return null;

  const where: Prisma.PracticeQuestionWhereInput = {
    workspaceId: member.user.workspaceId,
  };
  if (filters.topic && filters.topic !== "all") where.topic = filters.topic;
  if (filters.difficulty && filters.difficulty !== "all") {
    where.difficulty = filters.difficulty;
  }
  if (filters.mastered === "mastered") where.mastered = true;
  if (filters.mastered === "unmastered") where.mastered = false;

  return prisma.practiceQuestion.findMany({
    where,
    orderBy: [{ topic: "asc" }, { createdAt: "desc" }],
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function getPracticeTopics() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.practiceQuestion.groupBy({
    by: ["topic"],
    where: { workspaceId: member.user.workspaceId },
    _count: { _all: true },
    orderBy: { topic: "asc" },
  });
}

export async function getQuizzes() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.quiz.findMany({
    where: { workspaceId: member.user.workspaceId },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { questions: true, attempts: true } },
      attempts: {
        where: { userId: member.user.id },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { score: true, total: true, completedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuiz(id: string) {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.quiz.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    include: {
      author: { select: { id: true, name: true } },
      questions: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getQuizAttempts(quizId?: string) {
  const member = await requireMember();
  if (!member.ok) return null;

  const where: Prisma.QuizAttemptWhereInput = {
    quiz: { workspaceId: member.user.workspaceId },
  };
  if (quizId) where.quizId = quizId;

  return prisma.quizAttempt.findMany({
    where,
    orderBy: { completedAt: "desc" },
    take: 50,
    include: {
      quiz: { select: { id: true, title: true, topic: true } },
      user: { select: { id: true, name: true } },
    },
  });
}

export async function getTopicAccuracy() {
  const member = await requireMember();
  if (!member.ok) return null;

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: member.user.id,
      quiz: { workspaceId: member.user.workspaceId },
    },
    include: { quiz: { select: { topic: true } } },
  });

  const byTopic = new Map<
    string,
    { score: number; total: number; attempts: number }
  >();
  for (const attempt of attempts) {
    const topic = attempt.quiz.topic ?? "General";
    const entry = byTopic.get(topic) ?? { score: 0, total: 0, attempts: 0 };
    entry.score += attempt.score;
    entry.total += attempt.total;
    entry.attempts += 1;
    byTopic.set(topic, entry);
  }

  return [...byTopic.entries()].map(([topic, value]) => ({
    topic,
    accuracy: value.total > 0 ? Math.round((value.score / value.total) * 100) : 0,
    attempts: value.attempts,
    score: value.score,
    total: value.total,
  }));
}

export async function getFlashcards(topic?: string) {
  const member = await requireMember();
  if (!member.ok) return null;

  const where: Prisma.FlashcardWhereInput = {
    userId: member.user.id,
  };
  if (topic && topic !== "all") where.topic = topic;

  return prisma.flashcard.findMany({
    where,
    orderBy: [{ topic: "asc" }, { dueDate: "asc" }],
  });
}

export async function getFlashcardTopics() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.flashcard.groupBy({
    by: ["topic"],
    where: { userId: member.user.id },
    _count: { _all: true },
    orderBy: { topic: "asc" },
  });
}

export async function getNotifications() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.notification.findMany({
    where: { userId: member.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
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
      take: 500,
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

export async function getDueFlashcards(limit = 20) {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.flashcard.findMany({
    where: { userId: member.user.id, dueDate: { lte: new Date() } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    take: limit,
  });
}

export type FlashcardStats = {
  total: number;
  due: number;
  newCards: number;
  learning: number;
  mastered: number;
  reviewed: number;
  avgEase: number;
  masteryRate: number;
};

export async function getFlashcardStats(): Promise<FlashcardStats | null> {
  const member = await requireMember();
  if (!member.ok) return null;

  const cards = await prisma.flashcard.findMany({
    where: { userId: member.user.id },
    select: {
      dueDate: true,
      repetitions: true,
      intervalDays: true,
      easeFactor: true,
    },
  });

  const now = new Date();
  const due = cards.filter((c) => c.dueDate <= now).length;
  const newCards = cards.filter((c) => c.repetitions === 0).length;
  const reviewed = cards.length - newCards;
  const learning = cards.filter(
    (c) => c.repetitions > 0 && c.intervalDays < 21,
  ).length;
  const mastered = cards.filter((c) => c.intervalDays >= 21).length;
  const avgEase =
    cards.length > 0
      ? Math.round(
          (cards.reduce((s, c) => s + c.easeFactor, 0) / cards.length) * 100,
        ) / 100
      : 0;

  return {
    total: cards.length,
    due,
    newCards,
    learning,
    mastered,
    reviewed,
    avgEase,
    masteryRate: reviewed > 0 ? Math.round((mastered / reviewed) * 100) : 0,
  };
}

export type MarathonLeaderboardRow = {
  userId: string;
  name: string | null;
  email: string;
  minutes: number;
  completed: number;
};

export type MarathonWithStats = Marathon & {
  sessions: MarathonLeaderboardRow[];
  mySession: MarathonSession | null;
  participants: number;
  completedSessions: number;
  totalMinutes: number;
};

export async function getMarathons(): Promise<
  MarathonWithStats[] | null
> {
  const member = await requireMember();
  if (!member.ok) return null;

  const marathons = await prisma.marathon.findMany({
    where: { workspaceId: member.user.workspaceId },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: {
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 100,
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  return marathons.map((m) => {
    const byUser = new Map<string, MarathonLeaderboardRow>();
    let mySession: MarathonSession | null = null;
    let totalMinutes = 0;
    let completedSessions = 0;

    for (const s of m.sessions) {
      totalMinutes += s.minutes;
      if (s.completed) completedSessions++;
      if (s.userId === member.user.id && !s.completed) mySession = s;
      const entry = byUser.get(s.userId) ?? {
        userId: s.userId,
        name: s.user.name,
        email: s.user.email,
        minutes: 0,
        completed: 0,
      };
      entry.minutes += s.minutes;
      if (s.completed) entry.completed++;
      byUser.set(s.userId, entry);
    }

    return {
      ...m,
      sessions: [...byUser.values()].sort((a, b) => b.minutes - a.minutes),
      mySession,
      participants: byUser.size,
      completedSessions,
      totalMinutes,
    };
  });
}

export type AnalyticsData = {
  radar: {
    topics: string[];
    quizAccuracy: number[];
    practiceMastery: number[];
  };
  retention: {
    repetitions: number[];
    avgInterval: number[];
    retentionRate: number;
  };
  leaderboard: {
    id: string;
    name: string | null;
    email: string;
    weekMinutes: number;
    streak: number;
    tasksDone: number;
    quizPct: number | null;
    marathonMinutes: number;
  }[];
  polygraph: {
    label: string;
    minutes: number;
    tasks: number;
    quizPct: number | null;
  }[];
  badges: {
    id: string;
    label: string;
    description: string;
    earned: boolean;
  }[];
  totals: {
    streak: number;
    weekMinutes: number;
    totalMinutes: number;
    dueFlashcards: number;
    masteredFlashcards: number;
  };
};

export async function getAnalytics(): Promise<AnalyticsData | null> {
  const member = await requireMember();
  if (!member.ok) return null;
  const { id: userId, workspaceId } = member.user;

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);

  const [
    attempts,
    practiceQuestions,
    flashcards,
    checkIns,
    completedTasks,
    marathonSessions,
    members,
  ] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId, quiz: { workspaceId } },
      include: { quiz: { select: { topic: true } } },
    }),
    prisma.practiceQuestion.findMany({
      where: { workspaceId },
      select: { topic: true, mastered: true },
    }),
    prisma.flashcard.findMany({
      where: { userId },
      select: { repetitions: true, intervalDays: true, dueDate: true },
    }),
    prisma.checkIn.findMany({
      where: { userId, date: { gte: addDays(today, -60) } },
      select: { date: true, durationMin: true, createdAt: true },
      orderBy: { date: "desc" },
      take: 500,
    }),
    prisma.task.findMany({
      where: { workspaceId, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: "desc" },
      take: 500,
    }),
    prisma.marathonSession.findMany({
      where: { userId, marathon: { workspaceId } },
      select: { minutes: true, completed: true },
    }),
    prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        checkIns: { select: { date: true, durationMin: true } },
        authoredTasks: {
          where: { completedAt: { not: null } },
          select: { id: true },
        },
        quizAttempts: { select: { score: true, total: true } },
        marathonSessions: { select: { minutes: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const topicStats = new Map<
    string,
    {
      quizScore: number;
      quizTotal: number;
      practiceTotal: number;
      practiceMastered: number;
    }
  >();
  for (const a of attempts) {
    const topic = a.quiz.topic ?? "General";
    const entry = topicStats.get(topic) ?? {
      quizScore: 0,
      quizTotal: 0,
      practiceTotal: 0,
      practiceMastered: 0,
    };
    entry.quizScore += a.score;
    entry.quizTotal += a.total;
    topicStats.set(topic, entry);
  }
  for (const q of practiceQuestions) {
    const entry = topicStats.get(q.topic) ?? {
      quizScore: 0,
      quizTotal: 0,
      practiceTotal: 0,
      practiceMastered: 0,
    };
    entry.practiceTotal++;
    if (q.mastered) entry.practiceMastered++;
    topicStats.set(q.topic, entry);
  }

  const topics = [...topicStats.keys()].slice(0, 8);
  const quizAccuracy = topics.map((t) => {
    const e = topicStats.get(t)!;
    return e.quizTotal > 0 ? Math.round((e.quizScore / e.quizTotal) * 100) : 0;
  });
  const practiceMastery = topics.map((t) => {
    const e = topicStats.get(t)!;
    return e.practiceTotal > 0
      ? Math.round((e.practiceMastered / e.practiceTotal) * 100)
      : 0;
  });

  const byRep = new Map<number, { sum: number; count: number }>();
  for (const c of flashcards) {
    const rep = Math.min(c.repetitions, 5);
    const entry = byRep.get(rep) ?? { sum: 0, count: 0 };
    entry.sum += c.intervalDays;
    entry.count++;
    byRep.set(rep, entry);
  }
  const repetitions = [...byRep.keys()].sort((a, b) => a - b);
  const avgInterval = repetitions.map(
    (r) => Math.round((byRep.get(r)!.sum / byRep.get(r)!.count) * 10) / 10,
  );
  const reviewedCards = flashcards.filter((c) => c.repetitions > 0).length;
  const masteredCards = flashcards.filter((c) => c.intervalDays >= 21).length;
  const retentionRate =
    reviewedCards > 0 ? Math.round((masteredCards / reviewedCards) * 100) : 0;

  const minutesByDay = new Map<string, number>();
  for (const c of checkIns) {
    const key = dateKey(c.date);
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + c.durationMin);
  }
  const tasksByDay = new Map<string, number>();
  for (const t of completedTasks) {
    if (!t.completedAt) continue;
    const key = dateKey(t.completedAt);
    tasksByDay.set(key, (tasksByDay.get(key) ?? 0) + 1);
  }
  const quizByDay = new Map<string, { score: number; total: number }>();
  for (const a of attempts) {
    if (!a.completedAt) continue;
    const key = dateKey(a.completedAt);
    const entry = quizByDay.get(key) ?? { score: 0, total: 0 };
    entry.score += a.score;
    entry.total += a.total;
    quizByDay.set(key, entry);
  }

  const polygraph: AnalyticsData["polygraph"] = [];
  for (let i = 13; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = dateKey(d);
    const q = quizByDay.get(key);
    polygraph.push({
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: minutesByDay.get(key) ?? 0,
      tasks: tasksByDay.get(key) ?? 0,
      quizPct: q && q.total > 0 ? Math.round((q.score / q.total) * 100) : null,
    });
  }

  const leaderboard = members
    .map((m) => {
      const weekMinutes = m.checkIns
        .filter((c) => c.date >= weekStart)
        .reduce((s, c) => s + c.durationMin, 0);
      const quizTotal = m.quizAttempts.reduce((s, a) => s + a.total, 0);
      const quizScore = m.quizAttempts.reduce((s, a) => s + a.score, 0);
      return {
        id: m.id,
        name: m.name,
        email: m.email,
        weekMinutes,
        streak: computeStreak(m.checkIns.map((c) => c.date)),
        tasksDone: m.authoredTasks.length,
        quizPct: quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : null,
        marathonMinutes: m.marathonSessions.reduce((s, s2) => s + s2.minutes, 0),
      };
    })
    .sort((a, b) => b.weekMinutes - a.weekMinutes);

  const totalMinutes = checkIns.reduce((s, c) => s + c.durationMin, 0);
  const streak = computeStreak(checkIns.map((c) => c.date));
  const weekMinutes = checkIns
    .filter((c) => c.date >= weekStart)
    .reduce((s, c) => s + c.durationMin, 0);
  const dueFlashcards = flashcards.filter((c) => c.dueDate <= new Date()).length;
  const earlyBird = checkIns.some((c) => c.createdAt.getHours() < 8);
  const perfectScore = attempts.some((a) => a.total > 0 && a.score === a.total);
  const marathonFinisher = marathonSessions.some((s) => s.completed);

  const badges: AnalyticsData["badges"] = [
    {
      id: "first-checkin",
      label: "First Steps",
      description: "Log your first study session",
      earned: checkIns.length > 0,
    },
    {
      id: "streak-3",
      label: "On a Roll",
      description: "Reach a 3-day streak",
      earned: streak >= 3,
    },
    {
      id: "streak-7",
      label: "Week Warrior",
      description: "Reach a 7-day streak",
      earned: streak >= 7,
    },
    {
      id: "minutes-600",
      label: "Marathoner",
      description: "600 total study minutes",
      earned: totalMinutes >= 600,
    },
    {
      id: "minutes-1000",
      label: "Scholar",
      description: "1,000 total study minutes",
      earned: totalMinutes >= 1000,
    },
    {
      id: "quiz-debut",
      label: "Quiz Debut",
      description: "Take your first quiz",
      earned: attempts.length > 0,
    },
    {
      id: "perfect",
      label: "Perfect Score",
      description: "Score 100% on a quiz",
      earned: perfectScore,
    },
    {
      id: "cards-10",
      label: "Card Collector",
      description: "Create 10 flashcards",
      earned: flashcards.length >= 10,
    },
    {
      id: "marathon",
      label: "Marathon Finisher",
      description: "Complete a marathon session",
      earned: marathonFinisher,
    },
    {
      id: "tasks-10",
      label: "Task Crusher",
      description: "Complete 10 tasks",
      earned: completedTasks.length >= 10,
    },
    {
      id: "early-bird",
      label: "Early Bird",
      description: "Check in before 8am",
      earned: earlyBird,
    },
  ];

  return {
    radar: { topics, quizAccuracy, practiceMastery },
    retention: { repetitions, avgInterval, retentionRate },
    leaderboard,
    polygraph,
    badges,
    totals: {
      streak,
      weekMinutes,
      totalMinutes,
      dueFlashcards,
      masteredFlashcards: masteredCards,
    },
  };
}

export type ResourceGroupCount = { group: string; count: number };

export async function getResources(filters?: {
  search?: string;
  group?: string;
  level?: ResourceLevel;
  type?: ResourceType;
  favoritesOnly?: boolean;
}) {
  const member = await requireMember();
  if (!member.ok) return null;

  const where: Prisma.ResourceWhereInput = { workspaceId: member.user.workspaceId };
  if (filters?.group) where.group = filters.group;
  if (filters?.level) where.level = filters.level;
  if (filters?.type) where.type = filters.type;
  if (filters?.favoritesOnly) where.favorite = true;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { source: { contains: filters.search, mode: "insensitive" } },
      { group: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.resource.findMany({
    where,
    orderBy: [{ group: "asc" }, { rank: "asc" }, { sourceIndex: "asc" }],
  });
}

export async function getResourceGroups(): Promise<ResourceGroupCount[] | null> {
  const member = await requireMember();
  if (!member.ok) return null;
  const rows = await prisma.resource.groupBy({
    by: ["group"],
    where: { workspaceId: member.user.workspaceId },
    _count: { _all: true },
  });
  return rows
    .map((r) => ({ group: r.group, count: r._count._all }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

/** Roadmap → items, for the "attach resource to item" picker. */
export async function getRoadmapItemOptions() {
  const member = await requireMember();
  if (!member.ok) return null;
  return prisma.roadmap.findMany({
    where: { workspaceId: member.user.workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      items: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true },
      },
    },
  });
}

