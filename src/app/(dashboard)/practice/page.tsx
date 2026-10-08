import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getPracticeQuestions,
  getPracticeTopics,
  type PracticeQuestionFilters,
} from "@/lib/queries";
import { PracticePageClient } from "@/components/practice/practice-page-client";

export const instant = false;

function parseParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value !== "string") return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export default async function PracticePage({
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
  const filters: PracticeQuestionFilters = {
    topic: parseParam(params.topic, ["all"], "all"),
    difficulty: parseParam(
      params.difficulty,
      ["all", "easy", "medium", "hard"] as const,
      "all",
    ),
    mastered: parseParam(
      params.mastered,
      ["all", "mastered", "unmastered"] as const,
      "all",
    ),
  };

  const [questions, topics] = await Promise.all([
    getPracticeQuestions(filters),
    getPracticeTopics(),
  ]);

  if (!questions || !topics) {
    redirect("/sign-in");
  }

  return (
    <PracticePageClient
      initialQuestions={questions}
      topics={topics.map((t) => t.topic)}
      filters={filters}
      currentUserId={session.user.id}
    />
  );
}
