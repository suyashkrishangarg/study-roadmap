"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import { startOfDay } from "@/lib/dates";
import type { CheckIn } from "@prisma/client";

export async function createCheckIn(input: {
  subject: string;
  durationMin: number;
  note?: string;
}): Promise<ActionResult<CheckIn>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const subject = input.subject.trim();
  if (!subject) return { ok: false, error: "Subject is required." };
  if (subject.length > 120) return { ok: false, error: "Subject is too long (max 120 characters)." };

  const durationMin = Math.round(input.durationMin);
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { ok: false, error: "Duration must be a positive number of minutes." };
  }
  if (durationMin > 1440) {
    return { ok: false, error: "Duration can't exceed 24 hours." };
  }

  const note = input.note?.trim() || null;
  const date = startOfDay(new Date());

  const checkIn = await prisma.checkIn.upsert({
    where: { userId_date_subject: { userId: member.user.id, date, subject } },
    update: { durationMin: { increment: durationMin }, ...(note ? { note } : {}) },
    create: { userId: member.user.id, date, subject, durationMin, note },
  });

  return { ok: true, data: checkIn };
}
