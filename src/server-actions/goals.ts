"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import type { Goal, GoalFrequency } from "@prisma/client";

export async function createGoal(input: {
  frequency: GoalFrequency;
  targetMin: number;
  subject?: string;
}): Promise<ActionResult<Goal>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const targetMin = Math.round(input.targetMin);
  if (!Number.isFinite(targetMin) || targetMin <= 0) {
    return { ok: false, error: "Target must be a positive number of minutes." };
  }
  const max = input.frequency === "daily" ? 1440 : 10080;
  if (targetMin > max) {
    return { ok: false, error: `Target can't exceed ${max} minutes.` };
  }

  const goal = await prisma.goal.create({
    data: {
      frequency: input.frequency,
      targetMin,
      subject: input.subject?.trim() || null,
      userId: member.user.id,
    },
  });

  return { ok: true, data: goal };
}

export async function updateGoal(
  id: string,
  input: { frequency?: GoalFrequency; targetMin?: number; subject?: string | null },
): Promise<ActionResult<Goal>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.goal.findFirst({
    where: { id, userId: member.user.id },
    select: { id: true, frequency: true },
  });
  if (!existing) return { ok: false, error: "Goal not found." };

  const data: Parameters<typeof prisma.goal.update>[0]["data"] = {};
  if (input.frequency !== undefined) data.frequency = input.frequency;
  if (input.targetMin !== undefined) {
    const targetMin = Math.round(input.targetMin);
    if (!Number.isFinite(targetMin) || targetMin <= 0) {
      return { ok: false, error: "Target must be a positive number of minutes." };
    }
    const frequency = input.frequency ?? existing.frequency;
    const max = frequency === "daily" ? 1440 : 10080;
    if (targetMin > max) {
      return { ok: false, error: `Target can't exceed ${max} minutes.` };
    }
    data.targetMin = targetMin;
  }
  if (input.subject !== undefined) data.subject = input.subject?.trim() || null;

  const updated = await prisma.goal.update({ where: { id }, data });
  return { ok: true, data: updated };
}

export async function deleteGoal(id: string): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.goal.findFirst({
    where: { id, userId: member.user.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Goal not found." };

  await prisma.goal.delete({ where: { id } });
  return { ok: true, data: { id } };
}
