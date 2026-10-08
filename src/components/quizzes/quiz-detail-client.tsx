"use client";

import Link from "next/link";
import { ArrowLeft, Exam, Trophy } from "@phosphor-icons/react/ssr";
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
import type { getQuiz, getQuizAttempts, getTopicAccuracy } from "@/lib/queries";

type QuizDetail = Awaited<ReturnType<typeof getQuiz>>;
type AttemptList = Awaited<ReturnType<typeof getQuizAttempts>>;
type TopicAccuracy = Awaited<ReturnType<typeof getTopicAccuracy>>;

const typeLabel = {
  mcq: "Multiple choice",
  true_false: "True / False",
  short_answer: "Short answer",
} as const;

export function QuizDetailClient({
  quiz,
  attempts,
  topicAccuracy,
  currentUserId,
}: {
  quiz: NonNullable<QuizDetail>;
  attempts: NonNullable<AttemptList>;
  topicAccuracy: NonNullable<TopicAccuracy>;
  currentUserId: string;
}) {
  const myAttempts = attempts.filter((a) => a.userId === currentUserId);
  const best = myAttempts.reduce<number | null>(
    (best, a) => (a.total > 0 ? Math.max(best ?? 0, a.score / a.total) : best),
    null,
  );
  const relevantTopic = topicAccuracy.filter(
    (t) => quiz.topic && t.topic === quiz.topic,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          All quizzes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl tracking-tight md:text-3xl">{quiz.title}</h1>
          {quiz.topic && <Badge variant="secondary">{quiz.topic}</Badge>}
          <Badge variant="outline">{quiz.source}</Badge>
        </div>
        {quiz.description && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {quiz.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Questions</CardDescription>
            <CardTitle className="text-2xl">{quiz.questions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Attempts (workspace)</CardDescription>
            <CardTitle className="text-2xl">{attempts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Your best score</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy size={20} strokeWidth={1.5} aria-hidden="true" />
              {best !== null ? `${Math.round(best * 100)}%` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/quizzes/${quiz.id}/take`}>
            <Exam size={15} strokeWidth={1.5} aria-hidden="true" />
            Take quiz
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Questions</h2>
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {index + 1}. {question.prompt}
                  </p>
                  <Badge variant="outline" className="shrink-0">
                    {typeLabel[question.type]}
                  </Badge>
                </div>
                {question.options && (
                  <ul className="flex flex-wrap gap-1.5">
                    {(question.options as string[]).map((option, i) => (
                      <li key={i}>
                        <Badge variant="secondary">{option}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm">
                  <span className="font-medium">Answer:</span>{" "}
                  {question.answer}
                </p>
                {question.explanation && (
                  <p className="text-xs text-muted-foreground">
                    {question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Per-topic accuracy</h2>
            {topicAccuracy.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  No attempts yet — take the quiz to build accuracy stats.
                </CardContent>
              </Card>
            ) : (
              topicAccuracy.map((topic) => (
                <Card key={topic.topic}>
                  <CardContent className="flex flex-col gap-2 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-muted-foreground">
                        {topic.accuracy}% · {topic.attempts} attempt
                        {topic.attempts === 1 ? "" : "s"}
                      </span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </CardContent>
                </Card>
              ))
            )}
            {relevantTopic.length === 0 && quiz.topic && topicAccuracy.length > 0 && (
              <p className="text-xs text-muted-foreground">
                No attempts yet for topic &quot;{quiz.topic}&quot;.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Attempt history</h2>
            {attempts.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  No attempts yet.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col divide-y divide-border">
                  {attempts.map((attempt) => {
                    const pct =
                      attempt.total > 0
                        ? Math.round((attempt.score / attempt.total) * 100)
                        : 0;
                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between gap-2 py-2.5 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {attempt.user.name ?? "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {attempt.completedAt
                              ? attempt.completedAt.toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "In progress"}
                          </span>
                        </div>
                        <Badge
                          variant={pct >= 60 ? "default" : "destructive"}
                        >
                          {attempt.score}/{attempt.total} ({pct}%)
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
