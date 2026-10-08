"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CopySimple, Plus, Sparkle, Trash } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteFlashcard,
} from "@/server-actions/flashcards";
import { generateFlashcards } from "@/server-actions/ai-generation";
import { FlashcardFormDialog } from "@/components/flashcards/flashcard-form-dialog";
import { ReviewSession } from "@/components/flashcards/review-session";
import type { Flashcard } from "@prisma/client";
import type { FlashcardStats } from "@/lib/queries";

export function FlashcardsPageClient({
  initialFlashcards,
  dueFlashcards,
  stats,
  topics,
  filters,
}: {
  initialFlashcards: Flashcard[];
  dueFlashcards: Flashcard[];
  stats: FlashcardStats | null;
  topics: string[];
  filters: { topic: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"browse" | "review">("review");
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiPending, setAiPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function setTopicFilter(topic: string) {
    const params = new URLSearchParams(searchParams);
    if (topic === "all") {
      params.delete("topic");
    } else {
      params.set("topic", topic);
    }
    const query = params.toString();
    router.push(`/flashcards${query ? `?${query}` : ""}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this flashcard?")) return;
    setDeletingId(id);
    const result = await deleteFlashcard(id);
    setDeletingId(null);
    if (result.ok) router.refresh();
  }

  async function handleGenerate() {
    const topic = aiTopic.trim();
    if (!topic) {
      setAiError("Enter a topic to generate from.");
      return;
    }
    setAiPending(true);
    setAiError(null);
    const result = await generateFlashcards({ topic });
    setAiPending(false);
    if (result.ok) {
      setAiTopic("");
      router.refresh();
    } else {
      setAiError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">
            Flashcards
          </h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Review cards with spaced repetition and generate new ones
            with AI.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New flashcard
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-1 rounded-md border border-border p-1"
          role="tablist"
          aria-label="Flashcard view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "review"}
            onClick={() => setMode("review")}
            className={
              mode === "review"
                ? "rounded-sm bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground"
                : "rounded-sm px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Review{stats && stats.due > 0 ? ` (${stats.due} due)` : ""}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "browse"}
            onClick={() => setMode("browse")}
            className={
              mode === "browse"
                ? "rounded-sm bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground"
                : "rounded-sm px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Browse all
          </button>
        </div>
        {stats && mode === "review" && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{stats.due} due</Badge>
            <Badge variant="secondary">{stats.learning} learning</Badge>
            <Badge variant="secondary">{stats.mastered} mastered</Badge>
            <span>{stats.masteryRate}% mastery</span>
          </div>
        )}
      </div>

      {mode === "review" ? (
        <ReviewSession initialDue={dueFlashcards} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={filters.topic}
              onValueChange={setTopicFilter}
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
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="AI topic…"
                maxLength={120}
                className="w-44"
                autoComplete="off"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={aiPending}
              >
                <Sparkle size={14} strokeWidth={1.5} aria-hidden="true" />
                {aiPending ? "Generating…" : "Generate"}
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {initialFlashcards.length} cards
            </span>
          </div>
          {aiError && (
            <p className="text-sm text-destructive" role="alert">
              {aiError}
            </p>
          )}

          {initialFlashcards.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CopySimple size={18} strokeWidth={1.5} aria-hidden="true" />
                  No flashcards yet
                </CardTitle>
                <CardDescription>
                  Add cards manually or generate a set from a topic with
                  AI.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {initialFlashcards.map((flashcard) => (
                <FlashcardCard
                  key={flashcard.id}
                  flashcard={flashcard}
                  deleting={deletingId === flashcard.id}
                  onDelete={() => handleDelete(flashcard.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <FlashcardFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}

function FlashcardCard({
  flashcard,
  deleting,
  onDelete,
}: {
  flashcard: Flashcard;
  deleting: boolean;
  onDelete: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-24 flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-3 py-4 text-center transition-colors hover:bg-accent/40"
          aria-label={flipped ? "Show front" : "Show back"}
        >
          <span className="text-sm leading-relaxed">
            {flipped ? flashcard.back : flashcard.front}
          </span>
        </button>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {flashcard.topic && (
              <Badge variant="secondary">{flashcard.topic}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {flipped ? "Back" : "Front"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 hover:text-destructive"
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete flashcard"
          >
            <Trash size={15} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
