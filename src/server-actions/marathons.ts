"use server";

import { prisma } from "@/lib/db";
import { requireMember, requireAdmin, type ActionResult } from "@/lib/authz";
import { startOfDay } from "@/lib/dates";
import type { Marathon, MarathonSession } from "@prisma/client";

export async function createMarathon(input: {
  title: string;
  type: "scheduled" | "ondemand";
  startsAt?: string | null;
  durationMin: number;
  goalMin?: number | null;
}): Promise<ActionResult<Marathon>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 120)
    return { ok: false, error: "Title is too long (max 120 characters)." };
  if (
    !Number.isFinite(input.durationMin) ||
    input.durationMin < 1 ||
    input.durationMin > 1440
  ) {
    return {
      ok: false,
      error: "Duration must be between 1 and 1440 minutes.",
    };
  }

  let startsAt: Date | null = null;
  if (input.type === "scheduled") {
    if (!input.startsAt)
      return { ok: false, error: "Scheduled marathons need a start time." };
    const parsed = new Date(input.startsAt);
    if (isNaN(parsed.getTime()))
      return { ok: false, error: "Invalid start time." };
    startsAt = parsed;
  }

  const marathon = await prisma.marathon.create({
    data: {
      title,
      type: input.type,
      startsAt,
      durationMin: input.durationMin,
      goalMin: input.goalMin && input.goalMin > 0 ? input.goalMin : null,
      workspaceId: member.user.workspaceId,
    },
  });
  return { ok: true, data: marathon };
}

export async function deleteMarathon(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const member = await requireAdmin();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.marathon.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Marathon not found." };

  await prisma.marathon.delete({ where: { id } });
  return { ok: true, data: { id } };
}

export async function startMarathonSession(
  marathonId: string,
): Promise<ActionResult<MarathonSession>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const marathon = await prisma.marathon.findFirst({
    where: { id: marathonId, workspaceId: member.user.workspaceId },
    select: { id: true, type: true, startsAt: true },
  });
  if (!marathon) return { ok: false, error: "Marathon not found." };
  if (
    marathon.type === "scheduled" &&
    marathon.startsAt &&
    marathon.startsAt.getTime() > Date.now()
  ) {
    return { ok: false, error: "This marathon hasn't started yet." };
  }

  const existing = await prisma.marathonSession.findFirst({
    where: { marathonId, userId: member.user.id, completed: false },
  });
  if (existing) return { ok: true, data: existing };

  const session = await prisma.marathonSession.create({
    data: { marathonId, userId: member.user.id, startedAt: new Date() },
  });
  return { ok: true, data: session };
}

export async function logMarathonMinutes(
  marathonId: string,
  minutes: number,
): Promise<ActionResult<MarathonSession>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const session = await prisma.marathonSession.findFirst({
    where: { marathonId, userId: member.user.id, completed: false },
    select: { id: true },
  });
  if (!session)
    return { ok: false, error: "No active session. Start the marathon first." };

  const clamped = Math.max(0, Math.min(1440, Math.round(minutes)));
  const updated = await prisma.marathonSession.update({
    where: { id: session.id },
    data: { minutes: { increment: clamped } },
  });
  return { ok: true, data: updated };
}

export async function endMarathonSession(
  marathonId: string,
  minutes: number,
): Promise<ActionResult<{ session: MarathonSession; checkInMinutes: number }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const [marathon, session] = await Promise.all([
    prisma.marathon.findFirst({
      where: { id: marathonId, workspaceId: member.user.workspaceId },
      select: { id: true, title: true },
    }),
    prisma.marathonSession.findFirst({
      where: { marathonId, userId: member.user.id, completed: false },
      select: { id: true, minutes: true },
    }),
  ]);
  if (!marathon) return { ok: false, error: "Marathon not found." };
  if (!session)
    return { ok: false, error: "No active session to end." };

  const total = Math.max(0, Math.round(minutes));
  const finalMinutes = session.minutes + total;
  const updated = await prisma.marathonSession.update({
    where: { id: session.id },
    data: { minutes: finalMinutes, completed: true, endedAt: new Date() },
  });

  let checkInMinutes = 0;
  if (finalMinutes > 0) {
    const subject =
      marathon.title.length > 80 ? marathon.title.slice(0, 80) : marathon.title;
    const today = startOfDay(new Date());
    await prisma.checkIn.upsert({
      where: {
        userId_date_subject: { userId: member.user.id, date: today, subject },
      },
      update: { durationMin: { increment: finalMinutes } },
      create: {
        userId: member.user.id,
        date: today,
        subject,
        durationMin: finalMinutes,
      },
    });
    checkInMinutes = finalMinutes;
  }

  return { ok: true, data: { session: updated, checkInMinutes } };
}
