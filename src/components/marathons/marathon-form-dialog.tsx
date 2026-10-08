"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMarathon } from "@/server-actions/marathons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function toDateTimeLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export function MarathonFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"scheduled" | "ondemand">("ondemand");
  const [startsAt, setStartsAt] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [goalMin, setGoalMin] = useState(30);

  async function handleSubmit() {
    setPending(true);
    setError(null);
    const result = await createMarathon({
      title,
      type,
      startsAt:
        type === "scheduled" && startsAt
          ? new Date(startsAt).toISOString()
          : null,
      durationMin: Number(durationMin),
      goalMin: Number(goalMin) > 0 ? Number(goalMin) : null,
    });
    setPending(false);
    if (result.ok) {
      setTitle("");
      setDurationMin(60);
      setGoalMin(30);
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
          <DialogTitle>New marathon</DialogTitle>
          <DialogDescription>
            A focused study event. Minutes count toward your goals
            and streaks.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="marathon-title">Title</Label>
            <Input
              id="marathon-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Biology exam cram"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="marathon-type">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                const next = v as "scheduled" | "ondemand";
                setType(next);
                if (next === "scheduled" && !startsAt) {
                  setStartsAt(
                    toDateTimeLocal(
                      new Date(Date.now() + 60 * 60 * 1000),
                    ),
                  );
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ondemand">
                  On-demand (start anytime)
                </SelectItem>
                <SelectItem value="scheduled">
                  Scheduled (fixed start time)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "scheduled" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="marathon-starts">Start time</Label>
              <Input
                id="marathon-starts"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="marathon-duration">
                Duration (minutes)
              </Label>
              <Input
                id="marathon-duration"
                type="number"
                min={1}
                max={1440}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="marathon-goal">
                Goal (minutes, optional)
              </Label>
              <Input
                id="marathon-goal"
                type="number"
                min={0}
                max={1440}
                value={goalMin}
                onChange={(e) => setGoalMin(Number(e.target.value))}
              />
            </div>
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
              {pending ? "Creating…" : "Create marathon"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
