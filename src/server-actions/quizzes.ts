"use server";

import { prisma } from "@/lib/db";
import { canEdit, requireMember, type ActionResult } from "@/lib/authz";
import { createNotification } from "@/lib/notifications";
import {
  Prisma,
  type QuestionType,
  type Quiz,
} from "@prisma/client";

export type QuizQuestionInput = {
  type: QuestionType;
  prompt: string;
  options?: string[] | null;
  answer: string;
  explanation?: string | null;
};

export async function createQuiz(input: {
  title: string;
  description?: string | null;
  topic?: string | null;
  source?: "manual" | "template" | "ai";
  questions: QuizQuestionInput[];
}): Promise<ActionResult<Quiz>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (title.length > 200) return { ok: false, error: "Title is too long (max 200 characters)." };
  if (!input.questions || input.questions.length === 0) {
    return { ok: false, error: "Add at least one question." };
  }
  if (input.questions.length > 25) {
    return { ok: false, error: "Quizzes are limited to 25 questions." };
  }

  const questions = input.questions
    .map((q, i) => ({
      type: q.type,
      prompt: q.prompt.trim(),
      options: q.options && q.options.length > 0
        ? q.options.map((o) => o.trim()).filter(Boolean)
        : Prisma.JsonNull,
      answer: q.answer.trim(),
      explanation: q.explanation?.trim() || null,
      sortOrder: i,
    }))
    .filter((q) => q.prompt && q.answer);

  if (questions.length === 0) {
    return { ok: false, error: "Every question needs a prompt and an answer." };
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description: input.description?.trim() || null,
      topic: input.topic?.trim() || null,
      source: input.source ?? "manual",
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
      questions: { create: questions },
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  return { ok: true, data: quiz };
}

export async function deleteQuiz(id: string): Promise<ActionResult<{ id: string }>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const existing = await prisma.quiz.findFirst({
    where: { id, workspaceId: member.user.workspaceId },
    select: { authorId: true },
  });
  if (!existing) return { ok: false, error: "Quiz not found." };
  if (!canEdit(existing, member.user)) {
    return { ok: false, error: "You can't delete this quiz." };
  }

  await prisma.quiz.delete({ where: { id } });
  return { ok: true, data: { id } };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function isCorrect(type: QuestionType, given: string, answer: string): boolean {
  const givenNorm = normalize(given);
  const answerNorm = normalize(answer);
  if (!givenNorm) return false;
  if (type === "short_answer") {
    return givenNorm === answerNorm || answerNorm.includes(givenNorm);
  }
  return givenNorm === answerNorm;
}

export type AttemptResult = {
  questionId: string;
  prompt: string;
  type: QuestionType;
  options: string[] | null;
  given: string;
  correctAnswer: string;
  explanation: string | null;
  correct: boolean;
};

export async function submitAttempt(
  quizId: string,
  answers: Record<string, string>,
): Promise<
  ActionResult<{
    score: number;
    total: number;
    pct: number;
    results: AttemptResult[];
    attemptId: string;
  }>
> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, workspaceId: member.user.workspaceId },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!quiz) return { ok: false, error: "Quiz not found." };

  let score = 0;
  const results: AttemptResult[] = quiz.questions.map((q) => {
    const given = (answers[q.id] ?? "").trim();
    const correct = isCorrect(q.type, given, q.answer);
    if (correct) score++;
    return {
      questionId: q.id,
      prompt: q.prompt,
      type: q.type,
      options: (q.options as string[] | null) ?? null,
      given,
      correctAnswer: q.answer,
      explanation: q.explanation,
      correct,
    };
  });

  const total = quiz.questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: member.user.id,
      score,
      total,
      answers: answers as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
  });

  await createNotification({
    userId: member.user.id,
    type: "quiz_graded",
    title: `Quiz graded: ${quiz.title}`,
    body: `You scored ${score}/${total} (${pct}%)`,
    refId: quiz.id,
  });

  return { ok: true, data: { score, total, pct, results, attemptId: attempt.id } };
}
