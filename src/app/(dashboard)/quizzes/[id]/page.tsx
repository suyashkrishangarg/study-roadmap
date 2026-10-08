import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuiz, getQuizAttempts, getTopicAccuracy } from "@/lib/queries";
import { QuizDetailClient } from "@/components/quizzes/quiz-detail-client";

export const instant = false;

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const { id } = await params;
  const [quiz, attempts, topicAccuracy] = await Promise.all([
    getQuiz(id),
    getQuizAttempts(id),
    getTopicAccuracy(),
  ]);

  if (!quiz || !attempts || !topicAccuracy) {
    redirect("/quizzes");
  }

  return (
    <QuizDetailClient
      quiz={quiz}
      attempts={attempts}
      topicAccuracy={topicAccuracy}
      currentUserId={session.user.id}
    />
  );
}
