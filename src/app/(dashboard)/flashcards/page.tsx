import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getFlashcards,
  getFlashcardTopics,
  getDueFlashcards,
  getFlashcardStats,
} from "@/lib/queries";
import { FlashcardsPageClient } from "@/components/flashcards/flashcards-page-client";

function parseParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value !== "string") return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const params = await searchParams;
  const topic = parseParam(params.topic, ["all"], "all");

  const [flashcards, topics, dueFlashcards, stats] = await Promise.all([
    getFlashcards(topic),
    getFlashcardTopics(),
    getDueFlashcards(),
    getFlashcardStats(),
  ]);

  if (!flashcards || !topics || !dueFlashcards) {
    redirect("/sign-in");
  }

  return (
    <FlashcardsPageClient
      initialFlashcards={flashcards}
      dueFlashcards={dueFlashcards}
      stats={stats}
      topics={topics.map((t) => t.topic).filter((t): t is string => t !== null)}
      filters={{ topic }}
    />
  );
}
