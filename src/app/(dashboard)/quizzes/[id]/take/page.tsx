import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuiz } from "@/lib/queries";
import { TakeQuizClient } from "@/components/quizzes/take-quiz-client";

export const instant = false;

export default async function TakeQuizPage({
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
  const quiz = await getQuiz(id);

  if (!quiz) {
    redirect("/quizzes");
  }

  const quizWithQuestions = {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      ...q,
      options: (q.options as string[] | null) ?? null,
    })),
  };

  return <TakeQuizClient quiz={quizWithQuestions} />;
}
