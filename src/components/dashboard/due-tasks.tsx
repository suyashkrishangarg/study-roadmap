"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/server-actions/tasks";
import { addTaskLinks, removeTaskLink } from "@/server-actions/resource-links";
import { ResourceLinks } from "@/components/resource-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, LinkSimple, ListChecks } from "@phosphor-icons/react/ssr";
import { startOfDay } from "@/lib/dates";
import type { ResourceLink, Task } from "@prisma/client";

export type DueTask = Task & {
  assignee: { id: string; name: string | null } | null;
  author: { id: string; name: string | null } | null;
  resourceLinks: Pick<ResourceLink, "id" | "title" | "url">[];
};

function CompleteButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [, action, isPending] = useActionState(async () => {
    const result = await updateTaskStatus(taskId, "done");
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
        aria-label="Mark task done"
      >
        <CheckCircle size={16} strokeWidth={1.5} aria-hidden="true" />
      </Button>
    </form>
  );
}

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

export function DueTasks({
  tasks,
  currentUserId,
}: {
  tasks: DueTask[];
  currentUserId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks size={18} strokeWidth={1.5} aria-hidden="true" />
          <CardTitle className="text-base">Due soon</CardTitle>
        </div>
        <CardDescription>Tasks assigned to you or created by you.</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing due today. Enjoy the breathing room.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {tasks.map((task) => {
              const due = dueLabel(task.dueDate);
              const assigneeName =
                task.assignee?.id === currentUserId
                  ? "You"
                  : (task.assignee?.name ?? "Unassigned");
              return (
                <li
                  key={task.id}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                  <CompleteButton taskId={task.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {assigneeName}
                      {task.author?.id === currentUserId ? " · by you" : ""}
                    </p>
                  </div>
                  {priorityBadge(task.priority)}
                  {due && <Badge variant={due.tone}>{due.text}</Badge>}
                  <a
                    href={task.resourceLinks[0]?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      task.resourceLinks.length > 0
                        ? `Open ${task.resourceLinks.length} resource link${task.resourceLinks.length === 1 ? "" : "s"} for ${task.title}`
                        : undefined
                    }
                    title={
                      task.resourceLinks.length > 0
                        ? task.resourceLinks.map((l) => l.title).join(", ")
                        : "No resource links"
                    }
                    onClick={(e) => {
                      if (task.resourceLinks.length === 0) e.preventDefault();
                    }}
                    className={task.resourceLinks.length === 0 ? "pointer-events-none opacity-40" : undefined}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <LinkSimple size={15} strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                  </a>
                  </div>
                  {task.resourceLinks.length > 1 && (
                    <div className="mt-1.5 pl-9">
                      <ResourceLinks
                        links={task.resourceLinks.slice(1)}
                        onAdd={(links) => addTaskLinks(task.id, links)}
                        onRemove={(linkId) => removeTaskLink(task.id, linkId)}
                        compact
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
