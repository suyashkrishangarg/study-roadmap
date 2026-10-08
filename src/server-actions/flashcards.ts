"use server";

import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import { sm2, type SrsGrade } from "@/lib/srs";
import type { Flashcard } from "@prisma/client";

export async function createFlashcard(input: {
  front: string;
  back: string;
  topic?: string | null;
}): Promise<ActionResult<Flashcard>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const front = input.front.trim();
  const back = input.back.trim();
  if (!front) return { ok: false, error: "Front is required." };
  if (!back) return { ok: false, error: "Back is required." };

  const flashcard = await prisma.flashcard.create({
    data: {
      front,
      back,
      topic: input.topic?.trim() || null,
      userId: member.user.id,
    },
  });
  return { ok: true, data: flashcard };
}

export async function deleteFlashcard(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.flashcard.findFirst({
    where: { id, userId: member.user.id },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Flashcard not found." };

  await prisma.flashcard.delete({ where: { id } });
  return { ok: true, data: { id } };
}

export async function reviewFlashcard(
  id: string,
  grade: SrsGrade,
): Promise<ActionResult<Flashcard>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.flashcard.findFirst({
    where: { id, userId: member.user.id },
    select: { id: true, easeFactor: true, intervalDays: true, repetitions: true },
  });
  if (!existing) return { ok: false, error: "Flashcard not found." };

  const next = sm2(existing, grade);
  const updated = await prisma.flashcard.update({
    where: { id },
    data: {
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lastReviewedAt: new Date(),
    },
  });
  return { ok: true, data: updated };
}
