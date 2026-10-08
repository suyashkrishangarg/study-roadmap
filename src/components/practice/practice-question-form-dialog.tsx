"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPracticeQuestion,
  updatePracticeQuestion,
} from "@/server-actions/practice-questions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PracticeQuestionDifficulty } from "@prisma/client";
import type { PracticeQuestionWithAuthor } from "@/components/practice/practice-page-client";

export function PracticeQuestionFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: PracticeQuestionWithAuthor | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const optionsValue = (formData.get("options") as string) || "";
    const options = optionsValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      topic: formData.get("topic") as string,
      difficulty: formData.get("difficulty") as PracticeQuestionDifficulty,
      prompt: formData.get("prompt") as string,
      options: options.length > 0 ? options : null,
      solution: (formData.get("solution") as string) || null,
    };

    const result = initial
      ? await updatePracticeQuestion(initial.id, payload)
      : await createPracticeQuestion(payload);

    setPending(false);
    if (result.ok) {
      onOpenChange(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit question" : "New practice question"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update the question details."
              : "Add a question to the workspace bank."}
          </DialogDescription>
        </DialogHeader>
        <form key={initial?.id ?? "new"} action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                required
                maxLength={120}
                defaultValue={initial?.topic ?? ""}
                placeholder="e.g. Algebra"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                name="difficulty"
                defaultValue={initial?.difficulty ?? "medium"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="prompt">Question</Label>
            <Textarea
              id="prompt"
              name="prompt"
              required
              rows={3}
              maxLength={2000}
              defaultValue={initial?.prompt ?? ""}
              placeholder="What do you want to practice?"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="options">
              Options <span className="text-muted-foreground">(one per line, optional)</span>
            </Label>
            <Textarea
              id="options"
              name="options"
              rows={3}
              maxLength={2000}
              defaultValue={
                (initial?.options as string[] | undefined)?.join("\n") ?? ""
              }
              placeholder={"Option A\nOption B\nOption C"}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="solution">
              Solution <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="solution"
              name="solution"
              rows={2}
              maxLength={2000}
              defaultValue={initial?.solution ?? ""}
              placeholder="Answer or worked solution"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : initial ? "Save changes" : "Add question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
