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

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      status: { not: "done" },
      dueDate: { gte: now, lte: horizon },
      OR: [{ assigneeId: userId }, { authorId: userId }],
    },
    select: { id: true, title: true, dueDate: true },
  });

  for (const task of tasks) {
    if (!task.dueDate) continue;
    const existing = await prisma.notification.findFirst({
      where: { userId, type: "deadline_approaching", refId: task.id },
      select: { id: true },
    });
    if (existing) continue;
    await createNotification({
      userId,
      type: "deadline_approaching",
      title: `Due soon: ${task.title}`,
      body: `Due ${task.dueDate.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`,
      refId: task.id,
    });
  }

  const marathons = await prisma.marathon.findMany({
    where: { workspaceId, startsAt: { gte: now, lte: horizon } },
    select: { id: true, title: true, startsAt: true },
  });

  for (const marathon of marathons) {
    if (!marathon.startsAt) continue;
    const existing = await prisma.notification.findFirst({
      where: { userId, type: "marathon_starting", refId: marathon.id },
      select: { id: true },
    });
    if (existing) continue;
    await createNotification({
      userId,
      type: "marathon_starting",
      title: `Marathon starting: ${marathon.title}`,
      body: `Starts ${marathon.startsAt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}`,
      refId: marathon.id,
    });
  }
}
