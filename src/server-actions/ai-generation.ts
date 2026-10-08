"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember, type ActionResult } from "@/lib/authz";
import { startOfDay } from "@/lib/dates";
import {
  Prisma,
  type Flashcard,
  type Quiz,
  type QuizQuestion,
} from "@prisma/client";

const AI_QUIZ_DAILY_CAP = 5;
const AI_FLASHCARD_DAILY_CAP = 10;

const quizSchema = z.object({
  title: z.string().min(1).max(200),
  questions: z
    .array(
      z.object({
        type: z.enum(["mcq", "true_false", "short_answer"]),
        prompt: z.string().min(1),
        options: z.array(z.string()).optional(),
        answer: z.string().min(1),
        explanation: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export type GeneratedQuiz = Quiz & { questions: QuizQuestion[] };

export async function generateQuizFromTopic(input: {
  topic: string;
  notes?: string | null;
}): Promise<ActionResult<GeneratedQuiz>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const topic = input.topic.trim();
  if (!topic) return { ok: false, error: "Topic is required." };

  const today = startOfDay(new Date());
  const todaysCount = await prisma.quiz.count({
    where: { authorId: member.user.id, source: "ai", createdAt: { gte: today } },
  });
  if (todaysCount >= AI_QUIZ_DAILY_CAP) {
    return {
      ok: false,
      error: `Daily AI quiz limit reached (${AI_QUIZ_DAILY_CAP} per day). Try again tomorrow.`,
    };
  }

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: quizSchema,
    prompt: `Generate a quiz on the topic "${topic}"${
      input.notes ? ` based on these notes:\n${input.notes}` : ""
    }. Requirements: mix of multiple choice, true/false and short answer questions. For mcq, provide 4 options and set answer to the exact option text. For true_false, answer must be "True" or "False". For short_answer, answer is the accepted response (keep it short). Add a brief explanation for each question.`,
  });

  const questions = object.questions
    .map((q, i) => ({
      type: q.type,
      prompt: q.prompt,
      options:
        q.type === "mcq" && q.options && q.options.length > 0
          ? q.options
          : Prisma.JsonNull,
      answer: q.answer,
      explanation: q.explanation ?? null,
      sortOrder: i,
    }))
    .filter((q) => q.prompt && q.answer);

  if (questions.length === 0) {
    return { ok: false, error: "AI returned no usable questions. Try again." };
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: object.title,
      topic,
      source: "ai",
      authorId: member.user.id,
      workspaceId: member.user.workspaceId,
      questions: { create: questions },
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  return { ok: true, data: quiz };
}

const flashcardSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        topic: z.string().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export async function generateFlashcards(input: {
  topic: string;
  notes?: string | null;
}): Promise<ActionResult<Flashcard[]>> {
  const member = await requireMember();
  if (!member.ok) return { ok: false, error: member.error };

  const topic = input.topic.trim();
  if (!topic) return { ok: false, error: "Topic is required." };

  const today = startOfDay(new Date());
  const todaysCount = await prisma.flashcard.count({
    where: { userId: member.user.id, createdAt: { gte: today } },
  });
  if (todaysCount >= AI_FLASHCARD_DAILY_CAP) {
    return {
      ok: false,
      error: `Daily AI flashcard limit reached (${AI_FLASHCARD_DAILY_CAP} per day). Try again tomorrow.`,
    };
  }

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: flashcardSchema,
    prompt: `Create flashcards on the topic "${topic}"${
      input.notes ? ` based on these notes:\n${input.notes}` : ""
    }. Each card: front = a question or term, back = the answer or definition. Keep both concise.`,
  });

  const flashcards = await prisma.flashcard.createMany({
    data: object.cards.map((card) => ({
      front: card.front,
      back: card.back,
      topic: card.topic ?? topic,
      userId: member.user.id,
    })),
  });

  const created = await prisma.flashcard.findMany({
    where: { userId: member.user.id, createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
    take: object.cards.length,
  });

  return { ok: true, data: created.slice(0, flashcards.count) };
}
