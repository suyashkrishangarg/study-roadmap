import { prisma } from "@/lib/db";
import { addDays } from "@/lib/dates";
import type { Notification, NotificationType } from "@prisma/client";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  refId?: string | null;
}): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      refId: input.refId ?? null,
    },
  });
}

export async function ensureUpcomingNotifications(
  userId: string,
  workspaceId: string,
): Promise<void> {
  const now = new Date();
  const horizon = addDays(now, 1);

  const [tasks, marathons] = await Promise.all([
    prisma.task.findMany({
      where: {
        workspaceId,
        status: { not: "done" },
        dueDate: { gte: now, lte: horizon },
        OR: [{ assigneeId: userId }, { authorId: userId }],
      },
      select: { id: true, title: true, dueDate: true },
    }),
    prisma.marathon.findMany({
      where: { workspaceId, startsAt: { gte: now, lte: horizon } },
      select: { id: true, title: true, startsAt: true },
    }),
  ]);

  const candidates: { type: NotificationType; refId: string; title: string; body: string }[] = [];
  for (const task of tasks) {
    if (!task.dueDate) continue;
    candidates.push({
      type: "deadline_approaching",
      refId: task.id,
      title: `Due soon: ${task.title}`,
      body: `Due ${task.dueDate.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`,
    });
  }
  for (const marathon of marathons) {
    if (!marathon.startsAt) continue;
    candidates.push({
      type: "marathon_starting",
      refId: marathon.id,
      title: `Marathon starting: ${marathon.title}`,
      body: `Starts ${marathon.startsAt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`,
    });
  }
  if (candidates.length === 0) return;

  // Single lookup for all existing notifications (was 1 query PER task/marathon).
  const existing = await prisma.notification.findMany({
    where: {
      userId,
      OR: candidates.map((c) => ({ type: c.type, refId: c.refId })),
    },
    select: { type: true, refId: true },
  });
  const seen = new Set(existing.map((e) => `${e.type}:${e.refId}`));
  const fresh = candidates.filter((c) => !seen.has(`${c.type}:${c.refId}`));
  if (fresh.length === 0) return;

  await prisma.notification.createMany({
    data: fresh.map((c) => ({
      userId,
      type: c.type,
      title: c.title,
      body: c.body,
      refId: c.refId,
    })),
    skipDuplicates: true,
  });
}
