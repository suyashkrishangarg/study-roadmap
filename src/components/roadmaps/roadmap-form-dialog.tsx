"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoadmap, updateRoadmap } from "@/server-actions/roadmaps";
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
import type { RoadmapWithItems } from "@/components/roadmaps/roadmaps-page-client";

function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toInputDate(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function RoadmapFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: RoadmapWithItems | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const payload = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      startDate: (formData.get("startDate") as string)
        ? parseDate(formData.get("startDate") as string)
        : null,
      endDate: (formData.get("endDate") as string)
        ? parseDate(formData.get("endDate") as string)
        : null,
      color: (formData.get("color") as string) || null,
    };

    const result = initial
      ? await updateRoadmap(initial.id, payload)
      : await createRoadmap(payload);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit roadmap" : "New roadmap"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update the roadmap details." : "Plan a new track for the workspace."}
          </DialogDescription>
        </DialogHeader>
        <form key={initial?.id ?? "new"} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={160}
              defaultValue={initial?.title ?? ""}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              maxLength={2000}
              defaultValue={initial?.description ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={toInputDate(initial?.startDate ?? null)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={toInputDate(initial?.endDate ?? null)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color">
              Color <span className="text-muted-foreground">(optional, hex)</span>
            </Label>
            <Input
              id="color"
              name="color"
              placeholder="#3b82f6"
              maxLength={7}
              defaultValue={initial?.color ?? ""}
              autoComplete="off"
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
              {pending ? "Saving…" : initial ? "Save changes" : "Create roadmap"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
