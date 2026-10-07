"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createGoal, deleteGoal, updateGoal } from "@/server-actions/goals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PencilSimple, Plus, Target, Trash } from "@phosphor-icons/react/ssr";
import { formatMinutes } from "@/lib/dates";
import type { GoalFrequency } from "@prisma/client";

export type GoalWithProgress = {
  id: string;
  frequency: "daily" | "weekly";
  targetMin: number;
  subject: string | null;
  actualMin: number;
  pct: number;
};

export function GoalFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: GoalWithProgress | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const payload = {
      frequency: formData.get("frequency") as GoalFrequency,
      targetMin: Number(formData.get("targetMin")),
      subject: (formData.get("subject") as string) || null,
    };

    const result = initial
      ? await updateGoal(initial.id, payload)
      : await createGoal({ ...payload, subject: payload.subject || undefined });

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
          <DialogTitle>{initial ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update this study goal." : "Set a study time target."}
          </DialogDescription>
        </DialogHeader>
        <form key={initial?.id ?? "new"} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select name="frequency" defaultValue={initial?.frequency ?? "daily"}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetMin">Target (minutes)</Label>
            <Input
              id="targetMin"
              name="targetMin"
              type="number"
              required
              min={1}
              max={10080}
              step={1}
              defaultValue={initial?.targetMin ?? 60}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">
              Subject <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              maxLength={120}
              defaultValue={initial?.subject ?? ""}
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
              {pending ? "Saving…" : initial ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [, action, isPending] = useActionState(async () => {
    const result = await deleteGoal(goalId);
    if (result.ok) router.refresh();
    return result;
  }, null);

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-xs"
        disabled={isPending}
        aria-label="Delete goal"
      >
        <Trash size={16} strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </form>
  );
}

export function GoalsCard({ goals }: { goals: GoalWithProgress[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GoalWithProgress | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} strokeWidth={1.5} aria-hidden="true" />
            <CardTitle className="text-base">Goals</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setFormOpen(true)}
            aria-label="Add goal"
          >
            <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          </Button>
        </div>
        <CardDescription>Your study time targets.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No goals yet. Set a daily or weekly study target.
          </p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={goal.frequency === "daily" ? "default" : "secondary"}>
                    {goal.frequency === "daily" ? "Daily" : "Weekly"}
                  </Badge>
                  {goal.subject && (
                    <span className="truncate text-sm font-medium">
                      {goal.subject}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatMinutes(goal.actualMin)} / {formatMinutes(goal.targetMin)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditing(goal)}
                    aria-label="Edit goal"
                  >
                    <PencilSimple size={14} strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                  <DeleteGoalButton goalId={goal.id} />
                </div>
              </div>
              <Progress
                value={goal.pct}
                aria-label={`${goal.subject ?? "Study goal"} progress`}
              />
            </div>
          ))
        )}
      </CardContent>

      <GoalFormDialog
        open={formOpen || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        initial={editing}
      />
    </Card>
  );
}
