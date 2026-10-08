"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import type { Notification } from "@prisma/client";

export async function markNotificationRead(
  id: string,
): Promise<ActionResult<Notification>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.notification.findFirst({
    where: { id, userId: member.user.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Notification not found." };

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return { ok: true, data: updated };
}

export async function markAllNotificationsRead(): Promise<
  ActionResult<{ count: number }>
> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const result = await prisma.notification.updateMany({
    where: { userId: member.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  return { ok: true, data: { count: result.count } };
}
