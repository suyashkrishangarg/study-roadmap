"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFlashcard } from "@/server-actions/flashcards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FlashcardFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState("");

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await createFlashcard({ front, back, topic });
    setPending(false);
    if (result.ok) {
      setFront("");
      setBack("");
      setTopic("");
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New flashcard</DialogTitle>
          <DialogDescription>
            Front is the prompt, back is the answer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-front">Front</Label>
            <Textarea
              id="card-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Question or term"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-back">Back</Label>
            <Textarea
              id="card-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Answer or definition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="card-topic">
              Topic <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="card-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={120}
              placeholder="e.g. Biology"
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? "Saving…" : "Add flashcard"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
