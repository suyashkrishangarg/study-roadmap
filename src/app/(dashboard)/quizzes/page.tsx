import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getQuizzes } from "@/lib/queries";
import { QuizzesPageClient } from "@/components/quizzes/quizzes-page-client";


export default async function QuizzesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const quizzes = await getQuizzes();

  if (!quizzes) {
    redirect("/sign-in");
  }

  return (
    <QuizzesPageClient
      initialQuizzes={quizzes}
      currentUserId={session.user.id}
    />
  );
}
