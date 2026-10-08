"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BookOpen, CheckCircle, Circle, PencilSimple, Plus, Trash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deletePracticeQuestion,
  setPracticeQuestionMastered,
} from "@/server-actions/practice-questions";
import { PracticeQuestionFormDialog } from "@/components/practice/practice-question-form-dialog";
import type { PracticeQuestionFilters } from "@/lib/queries";
import type { PracticeQuestion } from "@prisma/client";

export type PracticeQuestionWithAuthor = PracticeQuestion & {
  author: { id: string; name: string | null };
};

const difficultyVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  easy: "secondary",
  medium: "default",
  hard: "destructive",
};

export function PracticePageClient({
  initialQuestions,
  topics,
  filters,
}: {
  initialQuestions: PracticeQuestionWithAuthor[];
  topics: string[];
  filters: PracticeQuestionFilters;
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PracticeQuestionWithAuthor | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  function setFilter(key: keyof PracticeQuestionFilters, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(`/practice${query ? `?${query}` : ""}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this question?")) return;
    setPendingId(id);
    const result = await deletePracticeQuestion(id);
    setPendingId(null);
    if (result.ok) router.refresh();
  }

  async function handleToggleMastered(question: PracticeQuestionWithAuthor) {
    setPendingId(question.id);
    const result = await setPracticeQuestionMastered(question.id, !question.mastered);
    setPendingId(null);
    if (result.ok) router.refresh();
  }

  const masteredCount = initialQuestions.filter((q) => q.mastered).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Practice questions</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Build a question bank by topic and track what you&apos;ve mastered.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New question
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.topic ?? "all"}
          onValueChange={(value) => setFilter("topic", value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.difficulty ?? "all"}
          onValueChange={(value) => setFilter("difficulty", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.mastered ?? "all"}
          onValueChange={(value) => setFilter("mastered", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Mastery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unmastered">Unmastered</SelectItem>
            <SelectItem value="mastered">Mastered</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {masteredCount}/{initialQuestions.length} mastered
        </span>
      </div>

      {initialQuestions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen size={18} strokeWidth={1.5} aria-hidden="true" />
              No questions yet
            </CardTitle>
            <CardDescription>
              Add your first practice question, or generate a quiz with AI from
              the Quizzes page.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {initialQuestions.map((question) => (
            <Card key={question.id}>
              <CardContent className="flex items-start gap-4 py-4">
                <button
                  type="button"
                  onClick={() => handleToggleMastered(question)}
                  disabled={pendingId === question.id}
                  className="mt-0.5 shrink-0 disabled:opacity-50"
                  aria-label={question.mastered ? "Mark as unmastered" : "Mark as mastered"}
                >
                  {question.mastered ? (
                    <CheckCircle size={20} className="text-primary" aria-hidden="true" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{question.prompt}</p>
                  {question.options && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {(question.options as string[]).map((option, i) => (
                        <li key={i}>
                          <Badge variant="outline">{option}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  {question.solution && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Solution: {question.solution}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{question.topic}</Badge>
                    <Badge variant={difficultyVariant[question.difficulty] ?? "outline"}>
                      {question.difficulty}
                    </Badge>
                    {question.mastered && <Badge>Mastered</Badge>}
                    <span className="text-xs text-muted-foreground">
                      by {question.author.name ?? "Anonymous"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => {
                      setEditing(question);
                      setFormOpen(true);
                    }}
                    aria-label="Edit question"
                  >
                    <PencilSimple size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0 hover:text-destructive"
                    onClick={() => handleDelete(question.id)}
                    disabled={pendingId === question.id}
                    aria-label="Delete question"
                  >
                    <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PracticeQuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
      />
    </div>
  );
}
