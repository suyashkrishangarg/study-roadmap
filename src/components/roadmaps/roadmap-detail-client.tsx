"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createRoadmapItem,
  deleteRoadmap,
  deleteRoadmapItem,
  updateRoadmapItem,
} from "@/server-actions/roadmaps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CircleDashed,
  PencilSimple,
  Plus,
  Trash,
} from "@phosphor-icons/react/ssr";
import type { Roadmap, RoadmapItemStatus } from "@prisma/client";
import type { WorkspaceMember } from "@/lib/queries";
import { RoadmapFormDialog } from "@/components/roadmaps/roadmap-form-dialog";

export type RoadmapDetail = Roadmap & {
  author: { id: string; name: string | null };
  items: {
    id: string;
    title: string;
    description: string | null;
    status: RoadmapItemStatus;
    progress: number;
    startDate: Date | null;
    endDate: Date | null;
    assignee: { id: string; name: string | null } | null;
  }[];
};

function itemStatusBadge(status: string) {
  if (status === "done") return <Badge variant="default">Done</Badge>;
  if (status === "in_progress") return <Badge variant="secondary">In progress</Badge>;
  return <Badge variant="outline">To do</Badge>;
}

function ItemStatusSelect({ itemId, status }: { itemId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(value: string) {
    setPending(true);
    const result = await updateRoadmapItem(itemId, {
      status: value as RoadmapItemStatus,
    });
    setPending(false);
    if (result.ok) router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todo">To do</SelectItem>
        <SelectItem value="in_progress">In progress</SelectItem>
        <SelectItem value="done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
}

function DeleteItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [, action, isPending] = useActionState(async () => {
    const result = await deleteRoadmapItem(itemId);
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
        aria-label="Delete item"
      >
        <Trash size={16} strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </form>
  );
}

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

function ItemFormDialog({
  open,
  onOpenChange,
  members,
  roadmapId,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WorkspaceMember[];
  roadmapId: string;
  initial?: RoadmapDetail["items"][number] | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const assigneeValue = (formData.get("assigneeId") as string) || "none";
    const payload = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      startDate: (formData.get("startDate") as string)
        ? parseDate(formData.get("startDate") as string)
        : null,
      endDate: (formData.get("endDate") as string)
        ? parseDate(formData.get("endDate") as string)
        : null,
      assigneeId: assigneeValue === "none" ? null : assigneeValue,
      progress: Number(formData.get("progress")) || 0,
    };

    const result = initial
      ? await updateRoadmapItem(initial.id, payload)
      : await createRoadmapItem(roadmapId, payload);

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
          <DialogTitle>{initial ? "Edit item" : "New item"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update this roadmap item." : "Add a step to this roadmap."}
          </DialogDescription>
        </DialogHeader>
        <form key={initial?.id ?? "new"} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={200}
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
              rows={2}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select name="assigneeId" defaultValue={initial?.assignee?.id ?? "none"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name ?? member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="progress">Progress (0–100)</Label>
              <Input
                id="progress"
                name="progress"
                type="number"
                min={0}
                max={100}
                step={1}
                defaultValue={initial?.progress ?? 0}
              />
            </div>
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
              {pending ? "Saving…" : initial ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoadmapDetailClient({
  roadmap,
  members,
}: {
  roadmap: RoadmapDetail;
  members: WorkspaceMember[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapDetail["items"][number] | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const done = roadmap.items.filter((i) => i.status === "done").length;
  const total = roadmap.items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const memberName = (id: string | null | undefined) => {
    if (!id) return "Unassigned";
    const member = members.find((m) => m.id === id);
    return member?.name ?? member?.email ?? "Unknown";
  };

  async function handleDeleteRoadmap() {
    setDeletePending(true);
    const result = await deleteRoadmap(roadmap.id);
    if (result.ok) {
      router.push("/roadmaps");
      router.refresh();
    } else {
      setDeletePending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/roadmaps"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
        All roadmaps
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-xl">{roadmap.title}</CardTitle>
              {roadmap.description && (
                <CardDescription className="max-w-2xl">
                  {roadmap.description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <PencilSimple size={14} strokeWidth={1.5} aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteRoadmap}
                disabled={deletePending}
              >
                <Trash size={14} strokeWidth={1.5} aria-hidden="true" />
                {deletePending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Progress value={pct} aria-label={`${roadmap.title} progress`} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {done} of {total} items complete
            </span>
            <span>
              {roadmap.startDate && roadmap.endDate
                ? `${roadmap.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${roadmap.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "No dates set"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Items</h2>
        <Button size="sm" onClick={() => setItemFormOpen(true)}>
          <Plus size={14} strokeWidth={1.5} aria-hidden="true" />
          Add item
        </Button>
      </div>

      {roadmap.items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <CircleDashed size={24} strokeWidth={1.5} aria-hidden="true" className="text-muted-foreground" />
          <p className="text-sm font-medium">No items yet.</p>
          <p className="text-sm text-muted-foreground">
            Break this roadmap into trackable steps.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {roadmap.items.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    item.status === "done"
                      ? "truncate text-sm text-muted-foreground line-through"
                      : "truncate text-sm font-medium"
                  }
                >
                  {item.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {memberName(item.assignee?.id)}
                  {item.startDate && item.endDate
                    ? ` · ${item.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${item.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : ""}
                </p>
              </div>
              {item.progress > 0 && item.status !== "done" && (
                <span className="hidden w-24 sm:block">
                  <Progress value={item.progress} aria-label={`${item.title} progress`} />
                </span>
              )}
              {itemStatusBadge(item.status)}
              <ItemStatusSelect itemId={item.id} status={item.status} />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditingItem(item)}
                aria-label="Edit item"
              >
                <PencilSimple size={16} strokeWidth={1.5} aria-hidden="true" />
              </Button>
              <DeleteItemButton itemId={item.id} />
            </li>
          ))}
        </ul>
      )}

      <RoadmapFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={roadmap}
      />
      <ItemFormDialog
        open={itemFormOpen || editingItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setItemFormOpen(false);
            setEditingItem(null);
          }
        }}
        members={members}
        roadmapId={roadmap.id}
        initial={editingItem}
      />
    </div>
  );
}
