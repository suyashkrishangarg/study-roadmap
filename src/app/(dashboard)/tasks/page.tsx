import { auth } from "@/lib/auth";
import { getTasks, getWorkspaceMembers, type TaskFilters } from "@/lib/queries";
import { redirect } from "next/navigation";
import { TasksPageClient } from "@/components/tasks/tasks-page-client";

function parseParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (typeof value !== "string") return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!session.user.workspaceId) {
    redirect("/");
  }

  const params = await searchParams;
  const filters: TaskFilters = {
    due: parseParam(params.due, ["all", "today", "week", "overdue"] as const, "all"),
    status: parseParam(params.status, ["all", "todo", "in_progress", "done"] as const, "all"),
    priority: parseParam(params.priority, ["all", "low", "medium", "high"] as const, "all"),
    assignee: parseParam(params.assignee, ["all", "me"] as const, "all"),
  };

  const [tasks, members] = await Promise.all([getTasks(filters), getWorkspaceMembers()]);

  if (!tasks || !members) {
    redirect("/sign-in");
  }

  return (
    <TasksPageClient
      initialTasks={tasks}
      members={members}
      filters={filters}
      currentUserId={session.user.id}
    />
  );
}
