"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTaskStatus } from "@/server-actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, PencilSimple, Trash } from "@phosphor-icons/react/ssr";
import { startOfDay } from "@/lib/dates";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import type { Task } from "@prisma/client";
import type { WorkspaceMember } from "@/lib/queries";

export type TaskWithRelations = Task & {
  assignee: { id: string; name: string | null } | null;
  author: { id: string; name: string | null } | null;
  roadmapItem: {
    id: string;
    title: string;
    roadmap: { id: string; title: string };
  } | null;
};

function dueLabel(dueDate: Date | null) {
  if (!dueDate) return null;
  const today = startOfDay(new Date());
  const due = startOfDay(dueDate);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) {
    return { text: `${-diff}d overdue`, tone: "destructive" as const };
  }
  if (diff === 0) return { text: "Today", tone: "default" as const };
  if (diff === 1) return { text: "Tomorrow", tone: "secondary" as const };
  return {
    text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tone: "outline" as const,
  };
}

function priorityBadge(priority: string) {
  if (priority === "high") return <Badge variant="destructive">High</Badge>;
  if (priority === "medium") return <Badge variant="secondary">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
}

function StatusButton({ taskId, status }: { taskId: string; status: string }) {
  const router = useRouter();
  const next = status === "done" ? "todo" : "done";
  const [, action, isPending] = useActionState(async () => {
    const result = await updateTaskStatus(taskId, next as "todo" | "done");
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
        aria-label={status === "done" ? "Reopen task" : "Mark task done"}
      >
        {status === "done" ? (
          <CheckCircle size={16} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Circle size={16} strokeWidth={1.5} aria-hidden="true" />
        )}
      </Button>
    </form>
  );
}

function DeleteButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [, action, isPending] = useActionState(async () => {
    const result = await deleteTask(taskId);
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
        aria-label="Delete task"
      >
        <Trash size={16} strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </form>
  );
}

export function TaskList({
  tasks,
  members,
  currentUserId,
}: {
  tasks: TaskWithRelations[];
  members: WorkspaceMember[];
  currentUserId: string;
}) {
  const [editing, setEditing] = useState<TaskWithRelations | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium">No tasks match these filters.</p>
        <p className="text-sm text-muted-foreground">
          Try different filters or create a new task.
        </p>
      </div>
    );
  }

  const memberName = (id: string | null | undefined) => {
    if (!id) return "Unassigned";
    const member = members.find((m) => m.id === id);
    return member?.name ?? member?.email ?? "Unknown";
  };

  return (
    <>
      <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {tasks.map((task) => {
          const due = dueLabel(task.dueDate);
          const assigneeName =
            task.assignee?.id === currentUserId
              ? "You"
              : memberName(task.assignee?.id);
          return (
            <li
              key={task.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <StatusButton taskId={task.id} status={task.status} />
              <div className="min-w-0 flex-1">
                <p
                  className={
                    task.status === "done"
                      ? "truncate text-sm text-muted-foreground line-through"
                      : "truncate text-sm font-medium"
                  }
                >
                  {task.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {assigneeName}
                  {task.author?.id === currentUserId ? " · by you" : ""}
                  {task.roadmapItem &&
                    ` · ${task.roadmapItem.roadmap.title} / ${task.roadmapItem.title}`}
                </p>
              </div>
              {priorityBadge(task.priority)}
              {due && <Badge variant={due.tone}>{due.text}</Badge>}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setEditing(task)}
                aria-label="Edit task"
              >
                <PencilSimple size={16} strokeWidth={1.5} aria-hidden="true" />
              </Button>
              <DeleteButton taskId={task.id} />
            </li>
          );
        })}
      </ul>
      <TaskFormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        members={members}
        initial={editing}
      />
    </>
  );
}
