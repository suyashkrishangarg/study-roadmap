"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Exam, Plus, Trash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { deleteQuiz } from "@/server-actions/quizzes";
import { QuizFormDialog } from "@/components/quizzes/quiz-form-dialog";
import type { Quiz } from "@prisma/client";

export type QuizWithMeta = Quiz & {
  author: { id: string; name: string | null };
  _count: { questions: number; attempts: number };
  attempts: { score: number; total: number; completedAt: Date | null }[];
};

const sourceLabel: Record<string, string> = {
  manual: "Manual",
  template: "Template",
  ai: "AI",
};

export function QuizzesPageClient({
  initialQuizzes,
}: {
  initialQuizzes: QuizWithMeta[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this quiz and all its attempts?")) return;
    setDeletingId(id);
    const result = await deleteQuiz(id);
    setDeletingId(null);
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Quizzes</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Create quizzes, take them, and track accuracy by topic.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New quiz
        </Button>
      </div>

      {initialQuizzes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Exam size={18} strokeWidth={1.5} aria-hidden="true" />
              No quizzes yet
            </CardTitle>
            <CardDescription>
              Create a quiz manually, from a template, or generate one with AI.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {initialQuizzes.map((quiz) => {
            const lastAttempt = quiz.attempts[0];
            const pct =
              lastAttempt && lastAttempt.total > 0
                ? Math.round((lastAttempt.score / lastAttempt.total) * 100)
                : null;
            return (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="hover:underline"
                      >
                        {quiz.title}
                      </Link>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 px-0 hover:text-destructive"
                      onClick={() => handleDelete(quiz.id)}
                      disabled={deletingId === quiz.id}
                      aria-label="Delete quiz"
                    >
                      <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                  </div>
                  <CardDescription>
                    {quiz.topic ? (
                      <Badge variant="secondary" className="mr-2">
                        {quiz.topic}
                      </Badge>
                    ) : null}
                    <Badge variant="outline">
                      {sourceLabel[quiz.source] ?? quiz.source}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{quiz._count.questions} questions</span>
                    <span>{quiz._count.attempts} attempts</span>
                    {pct !== null && (
                      <span>
                        Last score: {lastAttempt.score}/{lastAttempt.total} ({pct}
                        %)
                      </span>
                    )}
                  </div>
                  {pct !== null && <Progress value={pct} className="h-2" />}
                  <div className="flex gap-2">
                    <Button asChild size="sm">
                      <Link href={`/quizzes/${quiz.id}/take`}>Take quiz</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/quizzes/${quiz.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <QuizFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
