"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskList, type TaskWithRelations } from "@/components/tasks/task-list";
import type { TaskFilters, WorkspaceMember } from "@/lib/queries";

export function TasksPageClient({
  initialTasks,
  members,
  filters,
  currentUserId,
}: {
  initialTasks: TaskWithRelations[];
  members: WorkspaceMember[];
  filters: TaskFilters;
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);

  function setFilter(key: keyof TaskFilters, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(`/tasks${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight md:text-3xl">Tasks</h1>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            Track what you and your study group need to get done.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.due} onValueChange={(value) => setFilter("due", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Due today</SelectItem>
            <SelectItem value="week">Due this week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(value) => setFilter("status", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={(value) => setFilter("priority", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.assignee} onValueChange={(value) => setFilter("assignee", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="me">Assigned to me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TaskList tasks={initialTasks} members={members} currentUserId={currentUserId} />

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} members={members} />
    </div>
  );
}
