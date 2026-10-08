"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowCounterClockwise,
  CheckCircle,
  CopySimple,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reviewFlashcard } from "@/server-actions/flashcards";
import { nextIntervalLabel, type SrsGrade } from "@/lib/srs";
import type { Flashcard } from "@prisma/client";

const GRADES: { grade: SrsGrade; label: string; variant: "default" | "secondary" | "outline" | "destructive" }[] = [
  { grade: "again", label: "Again", variant: "destructive" },
  { grade: "hard", label: "Hard", variant: "outline" },
  { grade: "good", label: "Good", variant: "secondary" },
  { grade: "easy", label: "Easy", variant: "default" },
];

export function ReviewSession({
  initialDue,
}: {
  initialDue: Flashcard[];
}) {
  const router = useRouter();
  const [queue, setQueue] = useState<Flashcard[]>(initialDue);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [pending, setPending] = useState(false);
  const [results, setResults] = useState<Record<SrsGrade, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [done, setDone] = useState(false);

  if (queue.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            All caught up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No flashcards are due right now. Reviewed cards come back
            based on the SM-2 schedule.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const reviewed = results.again + results.hard + results.good + results.easy;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle size={18} strokeWidth={1.5} aria-hidden="true" />
            Session complete
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {reviewed} card{reviewed === 1 ? "" : "s"} reviewed.
          </p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <Badge key={g.grade} variant={g.variant}>
                {g.label}: {results[g.grade]}
              </Badge>
            ))}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => router.refresh()}
            >
              <ArrowCounterClockwise size={15} strokeWidth={1.5} aria-hidden="true" />
              Refresh queue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const card = queue[index];
  const reviewedCount = index;

  async function grade(grade: SrsGrade) {
    if (pending) return;
    setPending(true);
    const result = await reviewFlashcard(card.id, grade);
    setPending(false);
    if (!result.ok) return;
    setResults((r) => ({ ...r, [grade]: r[grade] + 1 }));
    setFlipped(false);
    if (grade === "again") {
      setQueue((q) => [...q, card]);
    }
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CopySimple size={18} strokeWidth={1.5} aria-hidden="true" />
            Review queue
          </CardTitle>
          <Badge variant="secondary">
            {reviewedCount + 1} / {queue.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 py-8 text-center transition-colors hover:bg-accent/40"
          aria-label={flipped ? "Show front" : "Show back"}
        >
          <span className="text-base leading-relaxed">
            {flipped ? card.back : card.front}
          </span>
        </button>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{flipped ? "Answer" : "Question"}</span>
          {card.topic && <Badge variant="outline">{card.topic}</Badge>}
        </div>
        {!flipped ? (
          <p className="text-center text-sm text-muted-foreground">
            Flip the card to grade yourself
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((g) => (
              <Button
                key={g.grade}
                type="button"
                variant={g.variant}
                onClick={() => grade(g.grade)}
                disabled={pending}
                className="flex-col gap-0.5"
              >
                <span>{g.label}</span>
                <span className="text-[10px] font-normal opacity-70">
                  {nextIntervalLabel(
                    {
                      easeFactor: card.easeFactor,
                      intervalDays: card.intervalDays,
                      repetitions: card.repetitions,
                    },
                    g.grade,
                  )}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
