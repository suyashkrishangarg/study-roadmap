"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowCounterClockwise, ArrowLeft, CheckCircle, XCircle } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAttempt, type AttemptResult } from "@/server-actions/quizzes";
import type { Quiz } from "@prisma/client";

type QuizWithQuestions = Quiz & {
  questions: {
    id: string;
    type: "mcq" | "true_false" | "short_answer";
    prompt: string;
    options: string[] | null;
    answer: string;
    explanation: string | null;
  }[];
};

export function TakeQuizClient({ quiz }: { quiz: QuizWithQuestions }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    score: number;
    total: number;
    pct: number;
    results: AttemptResult[];
  } | null>(null);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await submitAttempt(quiz.id, answers);
    setPending(false);
    if (result.ok) {
      setResults(result.data);
    } else {
      setError(result.error);
    }
  }

  const answered = quiz.questions.filter((q) => (answers[q.id] ?? "").trim()).length;

  if (results) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href={`/quizzes/${quiz.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
            Back to quiz
          </Link>
          <h1 className="mt-2 text-2xl tracking-tight md:text-3xl">
            Results: {quiz.title}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">
                {results.score}/{results.total} correct
              </CardTitle>
              <Badge variant={results.pct >= 60 ? "default" : "destructive"}>
                {results.pct}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={results.pct} className="h-2" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {results.results.map((result, index) => (
            <Card key={result.questionId}>
              <CardContent className="flex items-start gap-3 py-4">
                {result.correct ? (
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                ) : (
                  <XCircle size={20} className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {index + 1}. {result.prompt}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge variant={result.correct ? "default" : "destructive"}>
                      Your answer: {result.given || "(no answer)"}
                    </Badge>
                    {!result.correct && (
                      <Badge variant="secondary">
                        Correct: {result.correctAnswer}
                      </Badge>
                    )}
                  </div>
                  {result.explanation && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {result.explanation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/quizzes/${quiz.id}/take`}>
               <ArrowCounterClockwise size={15} strokeWidth={1.5} aria-hidden="true" />
              Retake
            </Link>
          </Button>
          <Button asChild>
            <Link href="/quizzes">Back to quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/quizzes/${quiz.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          Back to quiz
        </Link>
        <h1 className="mt-2 text-2xl tracking-tight md:text-3xl">{quiz.title}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {quiz.questions.length} questions · {answered} answered
        </p>
      </div>

      {quiz.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {quiz.description}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {quiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {index + 1}. {question.prompt}
                </CardTitle>
                <Badge variant="outline">
                  {question.type === "mcq"
                    ? "Multiple choice"
                    : question.type === "true_false"
                      ? "True / False"
                      : "Short answer"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {question.type === "mcq" && question.options ? (
                <RadioGroup
                  value={answers[question.id] ?? ""}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: value }))
                  }
                  className="flex flex-col gap-2"
                >
                  {question.options.map((option) => (
                    <div
                      key={option}
                      className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${option}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${option}`}
                        className="flex-1 cursor-pointer text-sm font-normal"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : question.type === "true_false" ? (
                <RadioGroup
                  value={answers[question.id] ?? ""}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: value }))
                  }
                  className="flex gap-4"
                >
                  {["True", "False"].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${option}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${option}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  value={answers[question.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                  rows={2}
                  maxLength={1000}
                  placeholder="Your answer"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={handleSubmit} disabled={pending || answered === 0}>
          {pending ? "Grading…" : "Submit quiz"}
        </Button>
        {answered < quiz.questions.length && (
          <span className="text-xs text-muted-foreground">
            {quiz.questions.length - answered} question(s) unanswered
          </span>
        )}
      </div>
    </div>
  );
}
