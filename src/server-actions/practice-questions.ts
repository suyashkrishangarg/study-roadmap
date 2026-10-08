"use server";

import { prisma } from "@/lib/db";
import { canEdit, requireMember, type ActionResult } from "@/lib/authz";
import {
  Prisma,
  type PracticeQuestion,
  type PracticeQuestionDifficulty,
} from "@prisma/client";

export async function createPracticeQuestion(input: {
  topic: string;
  difficulty?: PracticeQuestionDifficulty;
  prompt: string;
  options?: string[] | null;
  solution?: string | null;
}): Promise<ActionResult<PracticeQuestion>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const topic = input.topic.trim();
  const prompt = input.prompt.trim();
  if (!topic) return { ok: false, error: "Topic is required." };
  if (topic.length > 120) return { ok: false, error: "Topic is too long (max 120 characters)." };
  if (!prompt) return { ok: false, error: "Prompt is required." };

  const options =
    input.options && input.options.length > 0
      ? input.options.map((o) => o.trim()).filter(Boolean)
      : null;

  const question = await prisma.practiceQuestion.create({
    data: {
      topic,
      difficulty: input.difficulty ?? "medium",
      prompt,
      options: options ?? Prisma.JsonNull,
      solution: input.solution?.trim() || null,
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
    },
  });
  return { ok: true, data: question };
}

export async function updatePracticeQuestion(
  id: string,
  input: {
    topic?: string;
    difficulty?: PracticeQuestionDifficulty;
    prompt?: string;
    options?: string[] | null;
    solution?: string | null;
  },
): Promise<ActionResult<PracticeQuestion>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.practiceQuestion.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Question not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't edit this question." };
  }

  const data: Parameters<typeof prisma.practiceQuestion.update>[0]["data"] = {};
  if (input.topic !== undefined) {
    const topic = input.topic.trim();
    if (!topic) return { ok: false, error: "Topic is required." };
    data.topic = topic;
  }
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.prompt !== undefined) {
    const prompt = input.prompt.trim();
    if (!prompt) return { ok: false, error: "Prompt is required." };
    data.prompt = prompt;
  }
  if (input.options !== undefined) {
    const options =
      input.options && input.options.length > 0
        ? input.options.map((o) => o.trim()).filter(Boolean)
        : null;
    data.options = options ?? Prisma.JsonNull;
  }
  if (input.solution !== undefined) {
    data.solution = input.solution?.trim() || null;
  }

  const updated = await prisma.practiceQuestion.update({ where: { id }, data });
  return { ok: true, data: updated };
}

export async function deletePracticeQuestion(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.practiceQuestion.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Question not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't delete this question." };
  }

  await prisma.practiceQuestion.delete({ where: { id } });
  return { ok: true, data: { id } };
}

export async function setPracticeQuestionMastered(
  id: string,
  mastered: boolean,
): Promise<ActionResult<PracticeQuestion>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.practiceQuestion.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Question not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't update this question." };
  }

  const updated = await prisma.practiceQuestion.update({
    where: { id },
    data: { mastered },
  });
  return { ok: true, data: updated };
}
